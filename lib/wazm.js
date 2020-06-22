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
/* eslint valid-typeof: 'off' */

'use strict';

if (typeof WebAssembly !== 'object' || WebAssembly === null)
  throw new Error('WebAssembly not supported.');

const WASI = require('./wasi');

/*
 * Globals
 */

const BigInt = global.BigInt || Number;
const BigUint64Array = global.BigUint64Array || Uint32Array;
const BigInt64Array = global.BigInt64Array || Int32Array;

/*
 * Constants
 */

const BIG_U64_MIN = BigInt(0);
const BIG_U64_MAX = (BigInt(1) << BigInt(64)) - BigInt(1);
const BIG_I64_MIN = -(BigInt(1) << BigInt(63));
const BIG_I64_MAX = (BigInt(1) << BigInt(63)) - BigInt(1);

/*
 * WASM
 */

class WASM {
  constructor(code, options = {}) {
    this.module = null;
    this.instance = null;
    this.exports = Object.create(null);
    this.memory = { buffer: new ArrayBuffer(0) };
    this.open = this.open.bind(this);

    this._buffer = Buffer.from(this.memory.buffer);
    this._view = new DataView(this.memory.buffer);
    this._stack = new Stack(options.stackSize);
    this._waiting = [];
    this._error = null;

    this.wasi = new WASI({
      args: options.args,
      env: options.env,
      preopens: options.preopens,
      returnOnExit: options.returnOnExit
    });

    this.init(code, options);
  }

  get loaded() {
    return this.module != null;
  }

  get buffer() {
    if (this._buffer.buffer !== this.memory.buffer)
      this._buffer = Buffer.from(this.memory.buffer);

    return this._buffer;
  }

  get view() {
    if (this._view.buffer !== this.memory.buffer)
      this._view = new DataView(this.memory.buffer);

    return this._view;
  }

  init(code, options) {
    const info = {
      env: {
        // Even with STANDALONE_WASM=1, emscripten still
        // imports some nonstandard stuff, the most common
        // being the below function, used to notify the
        // binding that the memory object has been updated.
        //
        // While useful, it is not portable, and we already
        // solve this issue with getters/setters.
        emscripten_notify_memory_growth: (memoryIndex) => {}
      },
      wasi_snapshot_preview1: this.wasi.wasiImport
    };

    if (options.imports) {
      for (const key of Object.keys(options.imports)) {
        if (!info[key])
          info[key] = {};

        Object.assign(info[key], options.imports[key]);
      }
    }

    try {
      this.module = new WebAssembly.Module(code);
    } catch (e) {
      if (e instanceof RangeError) {
        this.initAsync(info, code);
        return;
      }
      throw e;
    }

    if (hasImport(this.module, 'env', 'main')) {
      // If the user built a library without
      // specifying it as a reactor, clang will
      // try to import a main function.
      //
      // This can be avoided by adding a main
      // function to the build, or by specifying
      // -mexec-command=reactor (once supported).
      //
      // For now, just account for the user's
      // sloppiness.
      info.env.main = () => {};
    }

    this.instance = new WebAssembly.Instance(this.module, info);
    this.finalize();
  }

  async initAsync(info, code) {
    try {
      this.module = await WebAssembly.compile(code);
      this.instance = await WebAssembly.instantiate(this.module, info);
    } catch (e) {
      this._error = e;
      this.notify(e);
      return;
    }

    this.finalize();
    this.notify();
  }

  async open() {
    if (this.module)
      return undefined;

    if (this._error)
      throw this._error;

    return new Promise((resolve, reject) => {
      this._waiting.push((err) => {
        if (err)
          reject(err);
        else
          resolve();
      });
    });
  }

  notify(err) {
    for (const cb of this._waiting)
      cb(err);

    this._waiting.length = 0;
  }

  finalize() {
    this.exports = this.instance.exports;
    this.memory = this.exports.memory;

    this.wasi[WASI.kSetMemory](this.memory);

    if (this.exports._initialize) {
      this.exports._initialize();
    } else if (this.exports.__wasm_call_ctors) {
      // WASI specifies an _initialize function
      // for "reactors" (libraries). In the case
      // the build did not link to crt1-reactor.o,
      // we can manually call __wasm_call_ctors,
      // which is always synthesized by the linker
      // and will be available if the binary was
      // built with --export-all.
      this.exports.__wasm_call_ctors();
    }

    this._stack.init(this.instance);
  }

  start() {
    return this.wasi.start(this.instance);
  }

  alloc(size) {
    assert((size >>> 0) === size);
    return this._stack.alloc(size);
  }

  save() {
    return this._stack.save();
  }

  restore(ptr) {
    assert((ptr >>> 0) === ptr);
    this._stack.restore(ptr);
  }

  malloc(size) {
    assert((size >>> 0) === size);

    if (!this.exports.malloc)
      throw new Error('`malloc` not available.');

    const ptr = this.exports.malloc(size);

    if (ptr === 0 && size !== 0)
      throw new Error('Allocation failed.');

    return ptr;
  }

  free(ptr) {
    assert((ptr >>> 0) === ptr);

    if (!this.exports.free)
      throw new Error('`free` not available.');

    if (ptr === 0)
      throw new Error('Invalid free.');

    this.exports.free(ptr);
  }

  write(value, type, heap = 0) {
    assert(type && typeof type.verify === 'function');
    assert(type.verify(value));
    assert((heap >>> 0) === heap);

    const size = type.size(value);
    const ptr = heap ? this.malloc(size) : this.alloc(size);

    type.write(this, ptr, value);

    return ptr;
  }

  read(ptr, type, size = 0) {
    assert((ptr >>> 0) === ptr);
    assert(type && typeof type.verify === 'function');
    assert((size >>> 0) === size);

    let len = size;

    if (type.width)
      len *= type.width;

    return type.read(this, ptr, len);
  }

  safe(fn) {
    assert(typeof fn === 'function');

    const ptr = this.save();

    try {
      return fn();
    } finally {
      this.restore(ptr);
    }
  }

  wrap(fn, ctx) {
    assert(typeof fn === 'function');

    const bound = fn.bind(ctx);

    return (...args) => {
      return this.safe(bound);
    };
  }
}

/*
 * Types
 */

const types = {
  u8: {
    verify(val) {
      return (val & 0xff) === val;
    },
    size(val) {
      return 1;
    },
    read(wasm, ptr, size) {
      return wasm.view.getUint8(ptr);
    },
    write(wasm, ptr, val) {
      wasm.view.setUint8(ptr, val);
    },
    width: 0,
    array: null
  },
  i8: {
    verify(val) {
      if ((val | 0) !== val)
        return false;

      return val >= -0x80 && val <= 0x7f;
    },
    size(val) {
      return 1;
    },
    read(wasm, ptr, size) {
      return wasm.view.getInt8(ptr);
    },
    write(wasm, ptr, val) {
      wasm.view.setInt8(ptr, val);
    },
    width: 0,
    array: null
  },
  u16: {
    verify(val) {
      return (val & 0xffff) === val;
    },
    size(val) {
      return 2;
    },
    read(wasm, ptr, size) {
      return wasm.view.getUint16(ptr, true);
    },
    write(wasm, ptr, val) {
      wasm.view.setUint16(ptr, val, true);
    },
    width: 0,
    array: null
  },
  i16: {
    verify(val) {
      if ((val | 0) !== val)
        return false;

      return val >= -0x8000 && val <= 0x7fff;
    },
    size(val) {
      return 2;
    },
    read(wasm, ptr, size) {
      return wasm.view.getInt16(ptr, true);
    },
    write(wasm, ptr, val) {
      wasm.view.setInt16(ptr, val, true);
    },
    width: 0,
    array: null
  },
  u32: {
    verify(val) {
      return (val & 0xffffffff) === val;
    },
    size(val) {
      return 4;
    },
    read(wasm, ptr, size) {
      return wasm.view.getUint32(ptr, true);
    },
    write(wasm, ptr, val) {
      wasm.view.setUint32(ptr, val, true);
    },
    width: 0,
    array: null
  },
  i32: {
    verify(val) {
      if ((val | 0) !== val)
        return false;

      return val >= -0x80000000 && val <= 0x7fffffff;
    },
    size(val) {
      return 4;
    },
    read(wasm, ptr, size) {
      return wasm.view.getInt32(ptr, true);
    },
    write(wasm, ptr, val) {
      wasm.view.setInt32(ptr, val, true);
    },
    width: 0,
    array: null
  },
  u64: {
    verify(val) {
      if (typeof val !== 'bigint')
        return false;

      return val >= BIG_U64_MIN && val <= BIG_U64_MAX;
    },
    size(val) {
      return 8;
    },
    read(wasm, ptr, size) {
      return wasm.view.getUint64(ptr, true);
    },
    write(wasm, ptr, val) {
      wasm.view.setUint64(ptr, val, true);
    },
    width: 0,
    array: null
  },
  i64: {
    verify(val) {
      if (typeof val !== 'bigint')
        return false;

      return val >= BIG_I64_MIN && val <= BIG_I64_MAX;
    },
    size(val) {
      return 8;
    },
    read(wasm, ptr, size) {
      return wasm.view.getInt64(ptr, true);
    },
    write(wasm, ptr, val) {
      wasm.view.setInt64(ptr, val, true);
    },
    width: 0,
    array: null
  },
  buffer: {
    verify(val) {
      return Buffer.isBuffer(val);
    },
    size(val) {
      return val.length;
    },
    read(wasm, ptr, size) {
      const out = Buffer.allocUnsafeSlow(size);

      wasm.buffer.copy(out, 0, ptr, ptr + size);

      return out;
    },
    write(wasm, ptr, val) {
      val.copy(wasm.buffer, ptr);
    },
    width: 0,
    array: null
  },
  string: {
    verify(val) {
      return typeof val === 'string';
    },
    size(val) {
      return Buffer.byteLength(val, 'utf8') + 1;
    },
    read(wasm, ptr, size) {
      return wasm.buffer.toString('utf8', ptr, ptr + size);
    },
    write(wasm, ptr, val) {
      const len = wasm.buffer.write(val, ptr, 'utf8');

      wasm.buffer[ptr + len] = 0;
    },
    width: 0,
    array: null
  },
  cstring: {
    verify(val) {
      return typeof val === 'string';
    },
    size(val) {
      return Buffer.byteLength(val, 'binary') + 1;
    },
    read(wasm, ptr, size) {
      let end = ptr;

      if (size != null) {
        end += size;
      } else {
        while (wasm.buffer[end] !== 0)
          end += 1;
      }

      return wasm.buffer.toString('binary', ptr, end);
    },
    write(wasm, ptr, val) {
      const len = wasm.buffer.write(val, ptr, 'binary');

      wasm.buffer[ptr + len] = 0;
    },
    width: 0,
    array: null
  }
};

for (const [type, TypedArray] of [[types.u8, Uint8Array],
                                  [types.i8, Int8Array],
                                  [types.u16, Uint16Array],
                                  [types.i16, Int16Array],
                                  [types.u32, Uint32Array],
                                  [types.i32, Int32Array],
                                  [types.u64, BigUint64Array],
                                  [types.i64, BigInt64Array]]) {
  type.array = {
    verify(val) {
      return val instanceof TypedArray;
    },
    size(val) {
      return val.byteLength;
    },
    read(wasm, ptr, size) {
      const tmp = new TypedArray(wasm.memory.buffer, ptr, size);
      const out = new TypedArray(tmp.length);

      out.set(tmp, 0);

      return out;
    },
    write(wasm, ptr, val) {
      const buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);

      wasm.buffer.set(buf, ptr);
    },
    width: TypedArray.BYTES_PER_ELEMENT,
    array: null
  };
}

/**
 * Stack
 */

class Stack {
  constructor(size = 1 ** 20) {
    this.size = size;
    this.exports = null;
    this.start = 0;
    this.ptr = 0;
  }

  init(instance) {
    this.exports = instance.exports;
    this.start = 0;
    this.ptr = 0;
  }

  _check() {
    if (!this.exports)
      throw new Error('Stack is not initialized.');

    // Use emscripten's stack helpers if available.
    if (this.exports.stackAlloc)
      return;

    // Otherwise, preallocate a slab on the heap.
    if (this.start === 0) {
      if (!this.exports.malloc || !this.exports.free)
        throw new Error('`malloc` and `free` must be exported!');

      this.start = this.exports.malloc(this.size);

      if (this.start === 0)
        throw new Error('Could not allocate stack.');

      this.ptr = this.start + this.size;
      this.ptr &= ~15;
    }
  }

  alloc(size) {
    this._check();

    if (this.exports.stackAlloc)
      return this.exports.stackAlloc(size);

    const save = this.ptr;

    this.ptr -= size;
    this.ptr &= ~15;

    if (this.ptr < this.start) {
      this.ptr = save;
      throw new RangeError('Stack overflow.');
    }

    return this.ptr;
  }

  save() {
    this._check();

    if (this.exports.stackSave)
      return this.exports.stackSave();

    return this.ptr;
  }

  restore(ptr) {
    this._check();

    if (this.exports.stackRestore) {
      this.exports.stackRestore(ptr);
      return;
    }

    this.ptr = ptr;
  }
}

/*
 * Helpers
 */

function assert(ok) {
  if (!ok)
    throw new Error('Assertion failure.');
}

function hasImport(ctx, module, name, kind = 'function') {
  if (!WebAssembly.Module.imports)
    return false;

  const imports = WebAssembly.Module.imports(ctx);

  for (const entry of imports) {
    if (entry.kind !== kind)
      continue;

    if (entry.module !== module)
      continue;

    if (entry.name === name)
      return true;
  }

  return false;
}

/*
 * Expose
 */

WASM.types = types;

module.exports = WASM;
