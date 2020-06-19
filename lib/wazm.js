/*!
 * wazm.js - wasm for node.js
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 *
 * Resources:
 *   https://emscripten.org/docs/api_reference/preamble.js.html
 *   https://github.com/emscripten-core/emscripten/blob/master/src/preamble.js
 *   https://github.com/emscripten-core/emscripten/blob/incoming/src/preamble_minimal.js
 *   https://github.com/emscripten-core/emscripten/blob/incoming/src/postamble.js
 *   https://github.com/emscripten-core/emscripten/blob/incoming/src/postamble_minimal.js
 *   https://github.com/emscripten-core/emscripten/blob/incoming/src/settings.js
 *   https://github.com/emscripten-core/emscripten/blob/master/tools/shared.py
 *   https://github.com/emscripten-core/emscripten/wiki/WebAssembly-Standalone
 *   https://github.com/emscripten-core/emscripten/pull/7815
 *   https://github.com/emscripten-core/emscripten/pull/8519
 *   https://github.com/WebAssembly/design/blob/master/BinaryEncoding.md#high-level-structure
 */

/* global WebAssembly */

'use strict';

if (typeof WebAssembly !== 'object' || WebAssembly === null)
  throw new Error('WebAssembly not supported.');

/*
 * Constants
 */

const WASM_PAGE_SIZE = 65536;
const RESIZE_LIMIT = 2147483648 - WASM_PAGE_SIZE;
const MIN_TOTAL_MEMORY = 16777216;

/*
 * WASM
 */

class WASM {
  constructor(code, options) {
    this.table = null;
    this.memory = null;
    this.buffer = null;
    this.b8 = null;
    this.i8 = null;
    this.i16 = null;
    this.i32 = null;
    this.i64 = null;
    this.u8 = null;
    this.u16 = null;
    this.u32 = null;
    this.u64 = null;
    this.f32 = null;
    this.f64 = null;
    this.tempRet0 = 0;
    this.params = null;

    this.open = this.open.bind(this);
    this.waiting = [];
    this.error = null;
    this.module = null;
    this.instance = null;
    this.exports = Object.create(null);

    this._malloc = null;
    this._memcpy = null;
    this._memset = null;
    this._free = null;

    this.init(code, options);
  }

  get loaded() {
    return this.module != null;
  }

  init(code, options) {
    const info = this.setup(code, options);

    try {
      this.module = new WebAssembly.Module(code);
    } catch (e) {
      if (e instanceof RangeError) {
        assert(e.message.includes('disallowed on the main thread'));
        this.initAsync(info, code);
        return;
      }
    }

    this.injectSyscalls(info);
    this.instance = new WebAssembly.Instance(this.module, info);
    this.finalize();
  }

  async initAsync(info, code) {
    try {
      this.module = await WebAssembly.compile(code);
      this.injectSyscalls(info);
      this.instance = await WebAssembly.instantiate(this.module, info);
    } catch (e) {
      this.error = e;
      this.notify(e);
      return;
    }

    this.notify();
    this.finalize();
  }

  async open() {
    if (this.module)
      return undefined;

    if (this.error)
      throw this.error;

    return new Promise((resolve, reject) => {
      this.waiting.push((err) => {
        if (err)
          reject(err);
        else
          resolve();
      });
    });
  }

  notify(err) {
    for (const cb of this.waiting)
      cb(err);

    this.waiting.length = 0;
  }

  setup(code, options) {
    const params = readMetadata(code);

    this.table = new WebAssembly.Table({
      initial: params.TABLE_SIZE,
      maximum: params.TABLE_SIZE,
      element: 'anyfunc'
    });

    if (params.ALLOW_MEMORY_GROWTH) {
      if (params.WASM_MEM_MAX !== 0) {
        this.memory = new WebAssembly.Memory({
          initial: params.TOTAL_MEMORY / WASM_PAGE_SIZE,
          maximum: params.WASM_MEM_MAX / WASM_PAGE_SIZE
        });
      } else {
        this.memory = new WebAssembly.Memory({
          initial: params.TOTAL_MEMORY / WASM_PAGE_SIZE
        });
      }
    } else {
      this.memory = new WebAssembly.Memory({
        initial: params.TOTAL_MEMORY / WASM_PAGE_SIZE,
        maximum: params.TOTAL_MEMORY / WASM_PAGE_SIZE
      });
    }

    this.updateViews();
    this.i32[params.DYNAMICTOP_PTR >>> 2] = params.DYNAMIC_BASE;

    this.i32[0] = 0x63736d65; // Heap cookie.
    this.i16[1] = 0x6373;

    if (this.u8[2] !== 0x73 || this.u8[3] !== 0x63)
      throw new Error('System must be little-endian!');

    const info = {
      env: {
        memory: this.memory,
        table: this.table,
        __memory_base: params.GLOBAL_BASE,
        __table_base: 0,
        abort: () => {
          throw new Error('Aborted.');
        },
        _abort: () => {
          throw new Error('Aborted.');
        },
        __handle_stack_overflow: () => {
          throw new RangeError('Out of stack space.');
        },
        abortStackOverflow: () => {
          throw new RangeError('Out of stack space.');
        },
        abortOnCannotGrowMemory: () => {
          throw new RangeError('Out of memory.');
        },
        ___assert_fail: (msg, file, line, func) => {
          msg = this.getNullString(msg);
          file = file ? this.getNullString(file) : 'unknown';
          func = func ? this.getNullString(func) : 'unknown';

          throw new Error(`Assertion failed: ${msg}, `
                        + `at: ${file}:${line}:${func}`);
        },
        setTempRet0: (ptr) => {
          this.tempRet0 = ptr;
          return ptr;
        },
        getTempRet0: () => this.tempRet0,
        ___setErrNo: (code) => {
          if (this.exports.___errno_location)
            this.i32[this.exports.___errno_location() >>> 2] = code;
          return code;
        },
        _emscripten_get_heap_size: () => {
          return this.buffer.byteLength;
        },
        _emscripten_memcpy_big: (src, dest, size) => {
          this.u8.set(this.u8.subarray(dest, dest + size), src);
        },
        _emscripten_resize_heap: (size) => {
          return this.resizeHeap(size);
        },
        emscripten_get_heap_size: () => {
          return this.buffer.byteLength;
        },
        emscripten_memcpy_big: (src, dest, size) => {
          this.u8.set(this.u8.subarray(dest, dest + size), src);
        },
        emscripten_resize_heap: (size) => {
          return this.resizeHeap(size);
        },
        tempDoublePtr: params.TEMP_DOUBLE_PTR,
        DYNAMICTOP_PTR: params.DYNAMICTOP_PTR,
        // Functions needed for -O0 and -O1:
        nullFunc_ii: (e) => {
          throw new Error('Invalid function pointer.');
        },
        nullFunc_iiii: (e) => {
          throw new Error('Invalid function pointer.');
        },
        nullFunc_jiji: (e) => {
          throw new Error('Invalid function pointer.');
        },
        ___lock: () => {},
        ___unlock: () => {}
      },
      global: {
        NaN,
        Infinity,
        'global.Math': Math,
        asm2wasm: {
          'f64-rem': (x, y) => x % y,
          'debugger': () => {}
        }
      }
    };

    this.tempRet0 = 0;
    this.params = params;
    this.writeStackCookie();

    if (options && options.env)
      Object.assign(info.env, options.env);

    return info;
  }

  injectSyscalls(info) {
    if (!WebAssembly.Module.imports)
      return;

    const items = WebAssembly.Module.imports(this.module);

    const syscall = (e, t) => {
      throw new Error('Invalid system call.');
    };

    for (const {module, name, kind} of items) {
      if (module !== 'env' && kind !== 'function')
        continue;

      if (!name.startsWith('___syscall'))
        continue;

      if (info.env[name] == null)
        info.env[name] = syscall;
    }
  }

  finalize() {
    const {params} = this;

    this.exports = this.instance.exports;
    this._malloc = this.wrap('malloc');
    this._memcpy = this.wrap('memcpy');
    this._memset = this.wrap('memset');
    this._free = this.wrap('free');

    if (params.METADATA_MAJOR !== 0x7761 || params.METADATA_MINOR !== 0x7a6d) {
      // Version 0.1 doesn't have these.
      params.STACK_BASE = this.exports.stackSave();
      params.TOTAL_STACK = params.DYNAMIC_BASE - params.STACK_BASE;
      params.STACK_MAX = params.STACK_BASE + params.TOTAL_STACK;
    }

    // Sanity checks.
    assert(params.STACK_BASE === this.exports.stackSave());
    assert(params.STACK_MAX === params.STACK_BASE + params.TOTAL_STACK);
    // assert(params.DYNAMIC_BASE === alignUp(params.STACK_MAX, 16));
  }

  updateViews() {
    this.buffer = this.memory.buffer;
    this.b8 = Buffer.from(this.buffer, 0, this.buffer.byteLength);
    this.i8 = new Int8Array(this.buffer);
    this.i16 = new Int16Array(this.buffer);
    this.i32 = new Int32Array(this.buffer);
    this.u8 = new Uint8Array(this.buffer);
    this.u16 = new Uint16Array(this.buffer);
    this.u32 = new Uint32Array(this.buffer);
    this.f32 = new Float32Array(this.buffer);
    this.f64 = new Float64Array(this.buffer);

    if (typeof BigInt64Array === 'function')
      this.i64 = new BigInt64Array(this.buffer);

    if (typeof BigUint64Array === 'function')
      this.u64 = new BigUint64Array(this.buffer);
  }

  resizeHeap(size) {
    if (!this.params.ALLOW_MEMORY_GROWTH)
      throw new RangeError('Cannot resize heap.');

    if (size > RESIZE_LIMIT)
      return false;

    const old = this.buffer.byteLength;

    let mem = Math.max(old, MIN_TOTAL_MEMORY);
    let result = -1;

    while (mem < size) {
      if (mem <= 536870912) {
        mem = alignUp(2 * mem, WASM_PAGE_SIZE);
      } else {
        mem = (3 * mem + 2147483648) / 4;
        mem = alignUp(mem, WASM_PAGE_SIZE);
        mem = Math.min(mem, RESIZE_LIMIT);
      }
    }

    if (this.params.WASM_MEM_MAX !== 0) {
      mem = Math.min(mem, this.params.WASM_MEM_MAX);
      if (mem === old)
        return false;
    }

    mem = alignUp(mem, WASM_PAGE_SIZE);

    try {
      result = this.memory.grow((mem - old) / WASM_PAGE_SIZE);
    } catch (e) {
      ;
    }

    if (result === -1)
      return false;

    this.updateViews();

    return true;
  }

  writeStackCookie() {
    const {STACK_MAX} = this.params;

    assert((STACK_MAX & 3) === 0);

    this.u32[(STACK_MAX >>> 2) - 1] = 0x02135467;
    this.u32[(STACK_MAX >>> 2) - 2] = 0x89bacdfe;
  }

  checkCookies() {
    const {STACK_MAX} = this.params;

    if (this.u32[(STACK_MAX >>> 2) - 1] !== 0x02135467
        || this.u32[(STACK_MAX >>> 2) - 2] !== 0x89bacdfe) {
      throw new Error('Stack overflow detected.');
    }

    if (this.u32[0] !== 0x63736d65)
      throw new Error('Null pointer dereference detected.');
  }

  call(name, ...args) {
    return this._call(this._func(name), args);
  }

  wrap(name) {
    const func = this._func(name);
    return (...args) => {
      return this._call(func, args);
    };
  }

  throws(name, ...args) {
    return this._throws(name, this._func(name), args);
  }

  curry(name) {
    const func = this._func(name);
    return (...args) => {
      return this._throws(name, func, args);
    };
  }

  sizeof(name) {
    assert(typeof name === 'string');

    switch (name) {
      case 'i1':
      case 'i8':
      case 'u1':
      case 'u8':
      case 'bool':
        return 1;
      case 'i16':
      case 'u16':
        return 2;
      case 'i32':
      case 'u32':
        return 4;
      case 'i64':
      case 'u64':
        return 8;
      case 'float':
        return 4;
      case 'double':
        return 8;
      case 'size':
        return 4;
    }

    if (name.charAt(name.length - 1) === '*')
      return 4;

    return this.call(`${name}_sizeof`);
  }

  _func(name) {
    assert(typeof name === 'string');

    // const func = this.exports[`_${name}`];
    const func = this.exports[name];

    if (typeof func !== 'function')
      throw new Error(`Method not available (${name}).`);

    return func;
  }

  _call(func, args) {
    const input = [];

    let save = 0;

    for (let arg of args) {
      if (typeof arg === 'string') {
        if (save === 0)
          save = this.exports.stackSave();

        const size = Buffer.byteLength(arg, 'utf8');
        const ptr = this.exports.stackAlloc(size + 1);

        assert(this.b8.write(arg, ptr, 'utf8') === size);

        this.b8[ptr + size] = 0;

        input.push(ptr);

        continue;
      }

      if (ArrayBuffer.isView(arg)) {
        if (save === 0)
          save = this.exports.stackSave();

        const buf = toArray(arg);
        const ptr = this.exports.stackAlloc(buf.length);

        this.u8.set(buf, ptr);

        input.push(ptr);

        continue;
      }

      if (arg == null)
        arg = 0;

      if (typeof arg === 'boolean')
        arg = arg >>> 0;

      if (typeof arg !== 'number')
        throw new TypeError(`Invalid argument: ${arg}.`);

      input.push(arg);
    }

    const result = func(...input);

    if (save !== 0)
      this.exports.stackRestore(save);

    this.checkCookies();

    return result;
  }

  _throws(name, func, args) {
    const result = this._call(func, args);

    if (result === 0)
      throw new Error(`${name} had a return value of 0.`);

    return result;
  }

  setU8(ptr, value) {
    this.u8[ptr >>> 0] = value;
    return this;
  }

  setI8(ptr, value) {
    this.i8[ptr >>> 0] = value;
    return this;
  }

  setU16(ptr, value) {
    this.u16[ptr >>> 1] = value;
    return this;
  }

  setI16(ptr, value) {
    this.i16[ptr >>> 1] = value;
    return this;
  }

  setU32(ptr, value) {
    this.u32[ptr >>> 2] = value;
    return this;
  }

  setI32(ptr, value) {
    this.i32[ptr >>> 2] = value;
    return this;
  }

  setU64(ptr, value) {
    return this.setI64(ptr, value);
  }

  setI64(ptr, value) {
    const neg = value < 0;

    if (neg)
      value = -value;

    let hi = (value / 0x100000000) | 0;
    let lo = value | 0;

    if (neg) {
      if (lo === 0) {
        hi = (~hi + 1) | 0;
      } else {
        hi = ~hi;
        lo = ~lo + 1;
      }
    }

    this.i32[ptr >>> 2] = lo;
    this.i32[(ptr + 4) >>> 2] = hi;

    return this;
  }

  setBU64(ptr, value) {
    this.u64[ptr >>> 3] = value;
    return this;
  }

  setBI64(ptr, value) {
    this.i64[ptr >>> 3] = value;
    return this;
  }

  setFloat(ptr, value) {
    this.f32[ptr >>> 2] = value;
    return this;
  }

  setDouble(ptr, value) {
    this.f64[ptr >>> 3] = value;
    return this;
  }

  setSize(ptr, value) {
    this.u32[ptr >>> 2] = value;
    return this;
  }

  setPointer(ptr, value) {
    this.u32[ptr >>> 2] = value;
    return this;
  }

  setArray(ptr, value) {
    this.u8.set(toArray(value), ptr);
    return this;
  }

  setBuffer(ptr, value) {
    assert(Buffer.isBuffer(value));
    this.u8.set(value, ptr);
    return this;
  }

  setString(ptr, str) {
    const size = this.b8.write(str, ptr, 'utf8');
    assert(size === Buffer.byteLength(str, 'utf8'));
    return this;
  }

  setNullString(ptr, str) {
    const size = Buffer.byteLength(str, 'binary');

    assert(this.b8.write(str, ptr, 'binary') === size);

    this.b8[ptr + size] = 0;

    return this;
  }

  write(ptr, value) {
    return this.setBuffer(ptr, value);
  }

  getU8(ptr) {
    return this.u8[ptr >>> 0];
  }

  getI8(ptr) {
    return this.i8[ptr >>> 0];
  }

  getU16(ptr) {
    return this.u16[ptr >>> 1];
  }

  getI16(ptr) {
    return this.i16[ptr >>> 1];
  }

  getU32(ptr) {
    return this.u32[ptr >>> 2];
  }

  getI32(ptr) {
    return this.i32[ptr >>> 2];
  }

  getU64(ptr) {
    const lo = this.u32[ptr >>> 2];
    const hi = this.u32[(ptr + 4) >>> 2];

    if ((hi & 0xffe00000) !== 0)
      throw new RangeError('Number exceeds 2^53-1');

    return hi * 0x100000000 + lo;
  }

  getI64(ptr) {
    const lo = this.u32[ptr >>> 2];
    const hi = this.i32[(ptr + 4) >>> 2];

    if (hi < 0) {
      let n = ~hi;

      if (lo === 0)
        n += 1;

      if ((n & 0xffe00000) !== 0)
        throw new RangeError('Number exceeds 2^53-1');
    }

    return hi * 0x100000000 + lo;
  }

  getBU64(ptr) {
    return this.u64[ptr >>> 3];
  }

  getBI64(ptr) {
    return this.i64[ptr >>> 3];
  }

  getFloat(ptr) {
    return this.f32[ptr >>> 2];
  }

  getDouble(ptr) {
    return this.f64[ptr >>> 3];
  }

  getSize(ptr) {
    return this.u32[ptr >>> 2];
  }

  getPointer(ptr) {
    return this.u32[ptr >>> 2];
  }

  getArray(ptr, size) {
    return this.getU8Array(ptr, size);
  }

  readArray(ptr, size) {
    return this.readU8Array(ptr, size);
  }

  getU8Array(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    if (ptr + size > this.u8.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.u8.subarray(ptr, ptr + size);
  }

  readU8Array(ptr, size) {
    return new Uint8Array(this.getU8Array(ptr, size));
  }

  getI8Array(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    if (ptr + size > this.i8.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.i8.subarray(ptr, ptr + size);
  }

  readI8Array(ptr, size) {
    return new Int8Array(this.getI8Array(ptr, size));
  }

  getU16Array(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    ptr >>>= 1;

    if (ptr + size > this.u16.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.u16.subarray(ptr, ptr + size);
  }

  readU16Array(ptr, size) {
    return new Uint16Array(this.getU16Array(ptr, size));
  }

  getI16Array(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    ptr >>>= 1;

    if (ptr + size > this.i16.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.i16.subarray(ptr, ptr + size);
  }

  readI16Array(ptr, size) {
    return new Int16Array(this.getI16Array(ptr, size));
  }

  getU32Array(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    ptr >>>= 2;

    if (ptr + size > this.u32.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.u32.subarray(ptr, ptr + size);
  }

  readU32Array(ptr, size) {
    return new Uint32Array(this.getU32Array(ptr, size));
  }

  getI32Array(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    ptr >>>= 2;

    if (ptr + size > this.i32.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.i32.subarray(ptr, ptr + size);
  }

  readI32Array(ptr, size) {
    return new Int32Array(this.getI32Array(ptr, size));
  }

  getU64Array(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    ptr >>>= 3;

    if (ptr + size > this.u64.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.u64.subarray(ptr, ptr + size);
  }

  readU64Array(ptr, size) {
    return new BigUint64Array(this.getU64Array(ptr, size));
  }

  getI64Array(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    ptr >>>= 3;

    if (ptr + size > this.i64.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.i64.subarray(ptr, ptr + size);
  }

  readI64Array(ptr, size) {
    return new BigInt64Array(this.getI64Array(ptr, size));
  }

  getFloatArray(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    ptr >>>= 2;

    if (ptr + size > this.f32.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.f32.subarray(ptr, ptr + size);
  }

  readFloatArray(ptr, size) {
    return new Float32Array(this.getFloatArray(ptr, size));
  }

  getDoubleArray(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    ptr >>>= 3;

    if (ptr + size > this.f64.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.f64.subarray(ptr, ptr + size);
  }

  readDoubleArray(ptr, size) {
    return new Float64Array(this.getDoubleArray(ptr, size));
  }

  getSizeArray(ptr, size) {
    return this.getU32Array(ptr, size);
  }

  readSizeArray(ptr, size) {
    return this.readU32Array(ptr, size);
  }

  getPointerArray(ptr, size) {
    return this.getU32Array(ptr, size);
  }

  readPointerArray(ptr, size) {
    return this.readU32Array(ptr, size);
  }

  getBuffer(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    if (ptr + size > this.b8.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return Buffer.from(this.buffer, ptr, size);
  }

  readBuffer(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    if (ptr + size > this.b8.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    const buf = Buffer.allocUnsafe(size);

    this.b8.copy(buf, 0, ptr, ptr + size);

    return buf;
  }

  getString(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    if (ptr + size > this.b8.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.b8.toString(ptr, ptr + size, 'utf8');
  }

  getNullString(ptr) {
    assert((ptr >>> 0) === ptr);

    let i = ptr;

    for (; i < this.b8.length; i++) {
      if (this.b8[i] === 0)
        break;
    }

    if (i === this.b8.length)
      throw new Error('Invalid pointer.');

    return this.b8.toString('binary', ptr, i);
  }

  read(ptr, size) {
    return this.readBuffer(ptr, size);
  }

  copy(ptr, value) {
    assert((ptr >>> 0) === ptr);

    const buf = toBuffer(value);

    if (ptr + buf.length > this.b8.length)
      throw new RangeError('Out of bounds.');

    this.b8.copy(buf, 0, ptr, ptr + buf.length);

    return buf;
  }

  malloc(size) {
    assert((size >>> 0) === size);

    const ptr = this._malloc(size);

    if (size !== 0 && ptr === 0)
      throw new RangeError('Allocation failed.');

    return ptr;
  }

  store(value) {
    const buf = toArray(value);
    const ptr = this.malloc(buf.length);

    this.u8.set(buf, ptr);

    return ptr;
  }

  memcpy(dest, src, size) {
    assert((dest >>> 0) === dest);
    assert((src >>> 0) === src);
    assert((size >>> 0) === size);

    if (size !== 0 && (dest | src) === 0)
      throw new RangeError('Invalid pointer.');

    this._memcpy(dest, src, size);
  }

  memset(dest, ch, size) {
    assert((dest >>> 0) === dest);
    assert((ch | 0) === ch);
    assert((size >>> 0) === size);

    if (size !== 0 && dest === 0)
      throw new RangeError('Invalid pointer.');

    this._memset(dest, ch, size);
  }

  free(ptr) {
    assert((ptr >>> 0) === ptr);

    if (ptr === 0)
      throw new RangeError('Invalid pointer.');

    this._free(ptr);
  }

  save() {
    return this.exports.stackSave();
  }

  alloc(size) {
    assert((size >>> 0) === size);
    return this.exports.stackAlloc(size);
  }

  push(value) {
    const buf = toArray(value);
    const ptr = this.exports.stackAlloc(buf.length);

    this.u8.set(buf, ptr);

    return ptr;
  }

  restore(ptr) {
    assert((ptr >>> 0) === ptr);

    if (ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.exports.stackRestore(ptr);
  }

  maybeAlloc(size, start = this.save()) {
    assert((start >>> 0) === start);

    // Note that the last 8 bytes of the
    // stack are used for the stack cookie.
    if (start + size > this.params.STACK_MAX - 8)
      return [this.malloc(size), true];

    return [this.alloc(size), false];
  }

  maybePush(value, start) {
    const buf = toArray(value);
    const [ptr, heap] = this.maybeAlloc(buf.length, start);

    this.u8.set(buf, ptr);

    return [ptr, heap];
  }

  pushU8(value) {
    const ptr = this.exports.stackAlloc(1);
    this.setU8(ptr, value);
    return ptr;
  }

  pushI8(value) {
    const ptr = this.exports.stackAlloc(1);
    this.setI8(ptr, value);
    return ptr;
  }

  pushU16(value) {
    const ptr = this.exports.stackAlloc(2);
    this.setU16(ptr, value);
    return ptr;
  }

  pushI16(value) {
    const ptr = this.exports.stackAlloc(2);
    this.setI16(ptr, value);
    return ptr;
  }

  pushU32(value) {
    const ptr = this.exports.stackAlloc(4);
    this.setU32(ptr, value);
    return ptr;
  }

  pushI32(value) {
    const ptr = this.exports.stackAlloc(4);
    this.setI32(ptr, value);
    return ptr;
  }

  pushU64(value) {
    const ptr = this.exports.stackAlloc(8);
    this.setU64(ptr, value);
    return ptr;
  }

  pushI64(value) {
    const ptr = this.exports.stackAlloc(8);
    this.setI64(ptr, value);
    return ptr;
  }

  pushBU64(value) {
    const ptr = this.exports.stackAlloc(8);
    this.setBU64(ptr, value);
    return ptr;
  }

  pushBI64(value) {
    const ptr = this.exports.stackAlloc(8);
    this.setBI64(ptr, value);
    return ptr;
  }

  pushFloat(value) {
    const ptr = this.exports.stackAlloc(4);
    this.setFloat(ptr, value);
    return ptr;
  }

  pushDouble(value) {
    const ptr = this.exports.stackAlloc(8);
    this.setDouble(ptr, value);
    return ptr;
  }

  pushSize(value) {
    const ptr = this.exports.stackAlloc(4);
    this.setSize(ptr, value);
    return ptr;
  }

  pushPointer(value) {
    const ptr = this.exports.stackAlloc(4);
    this.setPointer(ptr, value);
    return ptr;
  }

  pushArray(value) {
    return this.push(value);
  }

  maybePushArray(value, start) {
    return this.maybePush(value, start);
  }

  pushBuffer(value) {
    return this.push(value);
  }

  maybePushBuffer(value, start) {
    return this.maybePush(value, start);
  }

  pushString(value) {
    const size = Buffer.byteLength(value, 'utf8');
    const ptr = this.exports.stackAlloc(size);
    this.setString(ptr, value);
    return ptr;
  }

  maybePushString(value, start) {
    const size = Buffer.byteLength(value, 'utf8');
    const [ptr, heap] = this.maybeAlloc(size, start);
    this.setString(ptr, value);
    return [ptr, heap];
  }

  pushNullString(value) {
    const size = Buffer.byteLength(value, 'binary') + 1;
    const ptr = this.exports.stackAlloc(size);
    this.setNullString(ptr, value);
    return ptr;
  }

  maybePushNullString(value, start) {
    const size = Buffer.byteLength(value, 'binary') + 1;
    const [ptr, heap] = this.maybeAlloc(size, start);
    this.setNullString(ptr, value);
    return [ptr, heap];
  }
}

/*
 * Helpers
 */

function assert(ok) {
  if (!ok)
    throw new Error('Assertion failure.');
}

function toArray(buf) {
  if (buf instanceof Uint8Array)
    return buf;

  assert(ArrayBuffer.isView(buf));

  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

function toBuffer(buf) {
  if (Buffer.isBuffer(buf))
    return buf;

  assert(ArrayBuffer.isView(buf));

  return Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
}

function delebify(buf, offset) {
  assert(Buffer.isBuffer(buf));
  assert((offset >>> 0) === offset);

  let result = 0;
  let shift = 0;

  for (;;) {
    assert(offset < buf.length);

    const byte = buf[offset];

    offset += 1;
    result += (byte & 0x7f) * (2 ** shift);

    if (!(byte & 0x80))
      break;

    shift += 7;
  }

  return [result, offset];
}

function alignUp(x, multiple) {
  if (x % multiple > 0)
    x += multiple - (x % multiple);
  return x;
}

function readMetadata(data) {
  assert(Buffer.isBuffer(data));

  // Note: could use:
  // WebAssembly.Module.customSections(module, 'emscripten_metadata')[0];

  if (data.length < 4 + 4 + 1 + 1 + 1 + 10)
    throw new RangeError('Invalid binary.');

  const magic = data.readUInt32LE(0);
  const version = data.readUInt32LE(4);
  const code = data[8];

  assert(code === 0);

  // Get (name-size, name, contents) size.
  let [size, off] = delebify(data, 9);

  assert(off + size <= data.length);

  // Get name size.
  const nameSize = data[off];

  off += 1;

  assert(off + nameSize <= data.length);

  // Slice name.
  const name = data.toString('binary', off, off + nameSize);

  off += nameSize;

  if (name !== 'emscripten_metadata') // 19 bytes.
    throw new Error('Could not find metadata.');

  // Get the contents size.
  size -= (1 + nameSize);

  assert(off + size <= data.length);

  // Slice contents.
  data = data.slice(off, off + size);
  off = 0;

  const params = {
    MAGIC: magic,
    VERSION: version,
    METADATA_MAJOR: 0,
    METADATA_MINOR: 0,
    ABI_MAJOR: 0,
    ABI_MINOR: 0,
    WASM_BACKEND: 0,
    TOTAL_MEMORY: 0,
    TABLE_SIZE: 0,
    GLOBAL_BASE: 0,
    DYNAMIC_BASE: 0,
    DYNAMICTOP_PTR: 0,
    TEMP_DOUBLE_PTR: 0,
    STANDALONE_WASM: 0,
    // Extras.
    STACK_BASE: 0,
    TOTAL_STACK: 0,
    ALLOW_MEMORY_GROWTH: 0,
    WASM_MEM_MAX: 0,
    // Not serialized.
    STACK_MAX: 0
  };

  [params.METADATA_MAJOR, off] = delebify(data, off);
  [params.METADATA_MINOR, off] = delebify(data, off);

  const metaVersion = params.METADATA_MAJOR * 0x10000 + params.METADATA_MINOR;

  if (metaVersion > 3 && metaVersion !== 0x77617a6d)
    throw new Error('Unsupported metadata version.');

  [params.ABI_MAJOR, off] = delebify(data, off);
  [params.ABI_MINOR, off] = delebify(data, off);

  if (metaVersion >= 2)
    [params.WASM_BACKEND, off] = delebify(data, off);
  else
    params.WASM_BACKEND = 1;

  [params.TOTAL_MEMORY, off] = delebify(data, off);
  [params.TABLE_SIZE, off] = delebify(data, off);

  if (metaVersion >= 1) {
    [params.GLOBAL_BASE, off] = delebify(data, off);
    [params.DYNAMIC_BASE, off] = delebify(data, off);
    [params.DYNAMICTOP_PTR, off] = delebify(data, off);
    [params.TEMP_DOUBLE_PTR, off] = delebify(data, off);
  }

  if (metaVersion >= 3)
    [params.STANDALONE_WASM, off] = delebify(data, off);
  else
    params.STANDALONE_WASM = 0;

  if (metaVersion === 0x77617a6d) {
    [params.STACK_BASE, off] = delebify(data, off);
    [params.TOTAL_STACK, off] = delebify(data, off);
    [params.ALLOW_MEMORY_GROWTH, off] = delebify(data, off);
    [params.WASM_MEM_MAX, off] = delebify(data, off);
  }

  if (metaVersion === 0)
    throw new Error('Metadata version 0.0 not supported.');

  params.TOTAL_MEMORY *= WASM_PAGE_SIZE;
  params.TOTAL_STACK *= WASM_PAGE_SIZE;
  params.WASM_MEM_MAX *= WASM_PAGE_SIZE;
  params.STACK_MAX = params.STACK_BASE + params.TOTAL_STACK;

  return params;
}

/*
 * Expose
 */

module.exports = WASM;
