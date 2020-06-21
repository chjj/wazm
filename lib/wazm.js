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
 * WASM
 */

class WASM {
  constructor(code, options = {}) {
    this.table = null;
    this.memory = { buffer: new ArrayBuffer(0) };
    this._array = new Uint8Array(this.memory.buffer);
    this._buffer = Buffer.from(this.memory.buffer);
    this._view = new DataView(this.memory.buffer);
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

  get array() {
    if (this._array.buffer !== this.memory.buffer)
      this._array = Buffer.from(this.memory.buffer);

    return this._array;
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
        emscripten_notify_memory_growth: (memoryIndex) => {}
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

    this.wasi[WASI.kSetMemory](this.memory);

    if (this.exports._initialize)
      this.exports._initialize();

    if (this.exports.malloc)
      this._malloc = this.wrap('malloc');

    if (this.exports.free)
      this._free = this.wrap('free');
  }

  start() {
    return this.wasi.start(this.instance);
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

        assert(this.buffer.write(arg, ptr, 'binary') === size);

        this.buffer[ptr + size] = 0;

        input.push(ptr);

        continue;
      }

      if (ArrayBuffer.isView(arg)) {
        if (save === -1)
          save = this.exports.stackSave();

        const buf = toArray(arg);
        const ptr = this.exports.stackAlloc(buf.length);

        this.array.set(buf, ptr);

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
      throw new Error(`${name} failed.`);

    return result;
  }

  setU8(ptr, value) {
    this.view.setUint8(ptr, value);
    return this;
  }

  setI8(ptr, value) {
    this.view.setInt8(ptr, value);
    return this;
  }

  setU16(ptr, value) {
    this.view.setUint16(ptr, value, true);
    return this;
  }

  setI16(ptr, value) {
    this.view.setInt16(ptr, value, true);
    return this;
  }

  setU32(ptr, value) {
    this.view.setUint32(ptr, value, true);
    return this;
  }

  setI32(ptr, value) {
    this.view.setInt32(ptr, value, true);
    return this;
  }

  setU64(ptr, value) {
    this.view.setBigUint64(ptr, value, true);
    return this;
  }

  setI64(ptr, value) {
    this.view.setBigInt64(ptr, value, true);
    return this;
  }

  setFloat(ptr, value) {
    this.view.setFloat32(ptr, value, true);
    return this;
  }

  setDouble(ptr, value) {
    this.view.setFloat64(ptr, value, true);
    return this;
  }

  setSize(ptr, value) {
    this.view.setUint32(ptr, value, true);
    return this;
  }

  setPointer(ptr, value) {
    this.view.setUint32(ptr, value, true);
    return this;
  }

  setArray(ptr, value) {
    this.array.set(toArray(value), ptr);
    return this;
  }

  setBuffer(ptr, value) {
    assert(Buffer.isBuffer(value));

    this.array.set(value, ptr);

    return this;
  }

  setString(ptr, str) {
    const size = this.buffer.write(str, ptr, 'utf8');

    assert(size === Buffer.byteLength(str, 'utf8'));

    return this;
  }

  setNullString(ptr, str) {
    const size = Buffer.byteLength(str, 'binary');

    assert(this.buffer.write(str, ptr, 'binary') === size);

    this.buffer[ptr + size] = 0;

    return this;
  }

  write(ptr, value) {
    return this.setBuffer(ptr, value);
  }

  getU8(ptr) {
    return this.view.getUint8(ptr);
  }

  getI8(ptr) {
    return this.view.getInt8(ptr);
  }

  getU16(ptr) {
    return this.view.getUint16(ptr, true);
  }

  getI16(ptr) {
    return this.view.getInt16(ptr, true);
  }

  getU32(ptr) {
    return this.view.getUint32(ptr, true);
  }

  getI32(ptr) {
    return this.view.getInt32(ptr, true);
  }

  getU64(ptr) {
    return this.view.getBigUint64(ptr, true);
  }

  getI64(ptr) {
    return this.view.getBigInt64(ptr, true);
  }

  getFloat(ptr) {
    return this.view.getFloat32(ptr, true);
  }

  getDouble(ptr) {
    return this.view.getFloat64(ptr, true);
  }

  getSize(ptr) {
    return this.view.getUint32(ptr, true);
  }

  getPointer(ptr) {
    return this.view.getUint32(ptr, true);
  }

  getArray(TypedArray, ptr, len) {
    assert(typeof TypedArray === 'function');
    assert((ptr >>> 0) === ptr);
    assert((len >>> 0) === len);

    if (ptr % TypedArray.BYTES_PER_ELEMENT)
      throw new RangeError('Invalid alignment.');

    const size = len * TypedArray.BYTES_PER_ELEMENT;

    if (ptr + size > this.array.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    if (TypedArray.allocUnsafe)
      return TypedArray.from(this.memory.buffer, ptr, size);

    return new TypedArray(this.memory.buffer, ptr, size);
  }

  readArray(TypedArray, ptr, len) {
    assert(typeof TypedArray === 'function');
    assert((ptr >>> 0) === ptr);
    assert((len >>> 0) === len);

    const size = len * TypedArray.BYTES_PER_ELEMENT;

    if (ptr + size > this.array.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    const arr = new Uint8Array(size);
    const tmp = this.array.subarray(ptr, ptr + size);

    arr.set(tmp, 0);

    if (TypedArray.allocUnsafe)
      return TypedArray.from(arr.buffer, 0, arr.length);

    return new TypedArray(arr.buffer, 0, arr.length);
  }

  getBuffer(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    if (ptr + size > this.buffer.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return Buffer.from(this.buffer, ptr, size);
  }

  readBuffer(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    if (ptr + size > this.buffer.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    const buf = Buffer.allocUnsafeSlow(size);

    this.buffer.copy(buf, 0, ptr, ptr + size);

    return buf;
  }

  getString(ptr, size) {
    assert((ptr >>> 0) === ptr);
    assert((size >>> 0) === size);

    if (ptr + size > this.buffer.length)
      throw new RangeError('Out of bounds.');

    if (size !== 0 && ptr === 0)
      throw new RangeError('Invalid pointer.');

    return this.buffer.toString('utf8', ptr, ptr + size);
  }

  getNullString(ptr) {
    assert((ptr >>> 0) === ptr);

    let i = ptr;

    for (; i < this.buffer.length; i++) {
      if (this.buffer[i] === 0)
        break;
    }

    if (i === this.buffer.length)
      throw new Error('Invalid pointer.');

    return this.buffer.toString('binary', ptr, i);
  }

  read(ptr, size) {
    return this.readBuffer(ptr, size);
  }

  copy(ptr, value) {
    assert((ptr >>> 0) === ptr);

    const buf = toBuffer(value);

    if (ptr + buf.length > this.buffer.length)
      throw new RangeError('Out of bounds.');

    this.buffer.copy(buf, 0, ptr, ptr + buf.length);

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

    this.array.set(buf, ptr);

    return ptr;
  }

  memcpy(dst, src, size) {
    assert((dst >>> 0) === dst);
    assert((src >>> 0) === src);
    assert((size >>> 0) === size);

    if (size !== 0 && (dst | src) === 0)
      throw new RangeError('Invalid pointer.');

    this.array.set(this.array.subarray(src, src + size), dst);
  }

  memset(dst, ch, size) {
    assert((dst >>> 0) === dst);
    assert((ch | 0) === ch);
    assert((size >>> 0) === size);

    if (size !== 0 && dst === 0)
      throw new RangeError('Invalid pointer.');

    this.array.fill(ch, dst, dst + size);
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

    this.array.set(buf, ptr);

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

    if (size > 8192)
      return [this.malloc(size), true];

    return [this.alloc(size), false];
  }

  maybePush(value, start) {
    const buf = toArray(value);
    const [ptr, heap] = this.maybeAlloc(buf.length, start);

    this.array.set(buf, ptr);

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

/*
 * Expose
 */

module.exports = WASM;
