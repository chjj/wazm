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

const WASI = require('./wasi');

/*
 * Constants
 */

const WASM_PAGE_SIZE = 65536;

/*
 * WASM
 */

class WASM {
  constructor(code, options = {}) {
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
    this.params = null;

    this.open = this.open.bind(this);
    this.waiting = [];
    this.error = null;
    this.module = null;
    this.instance = null;
    this.exports = Object.create(null);

    this.wasi = new WASI({
      args: options.args,
      env: options.env,
      preopens: options.preopens,
      returnOnExit: options.returnOnExit
    });

    this._malloc = null;
    this._free = null;

    this.init(code, options);
  }

  get loaded() {
    return this.module != null;
  }

  init(code, options) {
    const info = {
      env: {
        emscripten_notify_memory_growth: (memoryIndex) => {
          this.memory = this.exports.memory;
          this.updateViews();
        }
      },
      wasi_snapshot_preview1: this.wasi.wasiImport
    };

    if (options.imports)
      Object.assign(info.env, options.imports);

    try {
      this.module = new WebAssembly.Module(code);
    } catch (e) {
      if (e instanceof RangeError) {
        this.initAsync(info, code);
        return;
      }
      throw e;
    }

    this.instance = new WebAssembly.Instance(this.module, info);
    this.finalize();
  }

  async initAsync(info, code) {
    try {
      this.module = await WebAssembly.compile(code);
      this.instance = await WebAssembly.instantiate(this.module, info);
    } catch (e) {
      this.error = e;
      this.notify(e);
      return;
    }

    this.finalize();
    this.notify();
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

  finalize() {
    this.exports = this.instance.exports;
    this.memory = this.exports.memory;

    this.updateViews();

    if (this.exports._initialize)
      this.exports._initialize();

    if (this.exports.malloc)
      this._malloc = this.wrap('malloc');

    if (this.exports.free)
      this._free = this.wrap('free');

    this.params = readMetadata(this.module);
  }

  start() {
    this.wasi.start(this.instance);
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
    this.i64 = new BigInt64Array(this.buffer);
    this.u64 = new BigUint64Array(this.buffer);

    this.wasi[WASI.kSetMemory](this.memory);
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

    const func = this.exports[name];

    if (typeof func !== 'function')
      throw new Error(`Method not available (${name}).`);

    return func;
  }

  _call(func, args) {
    const input = [];

    let save = -1;

    for (let arg of args) {
      if (typeof arg === 'string') {
        if (save === -1)
          save = this.exports.stackSave();

        const size = Buffer.byteLength(arg, 'binary');
        const ptr = this.exports.stackAlloc(size + 1);

        assert(this.b8.write(arg, ptr, 'binary') === size);

        this.b8[ptr + size] = 0;

        input.push(ptr);

        continue;
      }

      if (ArrayBuffer.isView(arg)) {
        if (save === -1)
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
        arg |= 0;

      if (typeof arg !== 'number')
        throw new TypeError(`Invalid argument: ${arg}.`);

      input.push(arg);
    }

    const result = func(...input);

    if (save !== -1)
      this.exports.stackRestore(save);

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
    this.u64[ptr >>> 3] = value;
    return this;
  }

  setI64(ptr, value) {
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
    return this.u64[ptr >>> 3];
  }

  getI64(ptr) {
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

    const buf = Buffer.allocUnsafeSlow(size);

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

  memcpy(dst, src, size) {
    assert((dst >>> 0) === dst);
    assert((src >>> 0) === src);
    assert((size >>> 0) === size);

    if (size !== 0 && (dst | src) === 0)
      throw new RangeError('Invalid pointer.');

    this.u8.set(this.u8.subarray(src, src + size), dst);
  }

  memset(dst, ch, size) {
    assert((dst >>> 0) === dst);
    assert((ch | 0) === ch);
    assert((size >>> 0) === size);

    if (size !== 0 && dst === 0)
      throw new RangeError('Invalid pointer.');

    this.u8.fill(ch, dst, dst + size);
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

    if (this.params.DYNAMIC_BASE) {
      if (start + size > this.params.DYNAMIC_BASE - 131072)
        return [this.malloc(size), true];
    } else {
      if (size < 16384)
        return [this.malloc(size), true];
    }

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
  assert(buf instanceof Uint8Array);
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

function readMetadata(module) {
  assert(module instanceof WebAssembly.Module);

  const params = {
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
    STANDALONE_WASM: 0
  };

  if (!WebAssembly.Module.customSections)
    return params;

  const sec = WebAssembly.Module.customSections(module, 'emscripten_metadata');

  if (sec.length === 0)
    return params;

  const data = new Uint8Array(sec[0]);

  let off = 0;

  // Metadata Serialization
  //
  // Version 0:
  //   - EMSCRIPTEN_METADATA_MAJOR
  //   - EMSCRIPTEN_METADATA_MINOR
  //   - EMSCRIPTEN_ABI_MAJOR
  //   - EMSCRIPTEN_ABI_MINOR
  //   - mem_size
  //   - table_size
  //
  // See:
  //   https://github.com/emscripten-core/emscripten/commit/0d83546
  //   https://github.com/emscripten-core/emscripten/blob/0d83546/tools/shared.py#L3006
  //
  // Version 1:
  //   - EMSCRIPTEN_METADATA_MAJOR
  //   - EMSCRIPTEN_METADATA_MINOR
  //   - EMSCRIPTEN_ABI_MAJOR
  //   - EMSCRIPTEN_ABI_MINOR
  //   - mem_size
  //   - table_size
  //   - global_base
  //   - dynamic_base
  //   - dynamictop_ptr
  //   - tempdouble_ptr
  //
  // See:
  //   https://github.com/emscripten-core/emscripten/commit/e7d3e0f
  //   https://github.com/emscripten-core/emscripten/blob/e7d3e0f/tools/shared.py#L2981
  //
  // Version 2:
  //   - EMSCRIPTEN_METADATA_MAJOR
  //   - EMSCRIPTEN_METADATA_MINOR
  //   - EMSCRIPTEN_ABI_MAJOR
  //   - EMSCRIPTEN_ABI_MINOR
  //   - Settings.WASM_BACKEND
  //   - mem_size
  //   - table_size
  //   - global_base
  //   - dynamic_base
  //   - dynamictop_ptr
  //   - tempdouble_ptr
  //
  // See:
  //   https://github.com/emscripten-core/emscripten/commit/95bf0f1
  //   https://github.com/emscripten-core/emscripten/blob/95bf0f1/tools/shared.py#L3077
  //
  // Version 3:
  //   - EMSCRIPTEN_METADATA_MAJOR
  //   - EMSCRIPTEN_METADATA_MINOR
  //   - EMSCRIPTEN_ABI_MAJOR
  //   - EMSCRIPTEN_ABI_MINOR
  //   - Settings.WASM_BACKEND
  //   - mem_size
  //   - table_size
  //   - global_base
  //   - dynamic_base
  //   - dynamictop_ptr
  //   - tempdouble_ptr
  //   - Settings.STANDALONE_WASM
  //
  // See:
  //   https://github.com/emscripten-core/emscripten/commit/49c12a9
  //   https://github.com/emscripten-core/emscripten/blob/49c12a9/tools/shared.py#L3055
  [params.METADATA_MAJOR, off] = delebify(data, off);
  [params.METADATA_MINOR, off] = delebify(data, off);

  const metaVersion = params.METADATA_MAJOR * 0x10000 + params.METADATA_MINOR;

  if (metaVersion < 1 || metaVersion > 3)
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

  params.TOTAL_MEMORY *= WASM_PAGE_SIZE;

  return params;
}

/*
 * Expose
 */

module.exports = WASM;
