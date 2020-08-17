'use strict';

const assert = require('assert');
const fs = require('fs');
const WASM = require('../');
const {types} = WASM;

const code = fs.readFileSync(`${__dirname}/keccak.wasm`);
const wasm = new WASM(code, {
  stackSize: 2 ** 20
});

function hashSlow(data) {
  const sizeof = wasm.exports.keccak_ctx_sizeof();

  return wasm.safe(() => {
    const ctx = wasm.alloc(sizeof);
    const out = wasm.alloc(32);
    const ptr = wasm.write(data, types.buffer);

    assert(wasm.exports.keccak_init(ctx, 256));

    wasm.exports.keccak_update(ctx, ptr, data.length);

    assert(wasm.exports.keccak_final(ctx, out, 0, 32, 0x06));

    return wasm.read(out, types.buffer, 32);
  });
}

class Hash {
  constructor() {
    this.ctx = 0;
  }

  init(bits = 256) {
    const sizeof = wasm.exports.keccak_ctx_sizeof();

    this.ctx = wasm.malloc(sizeof);

    assert(this.ctx);

    assert(wasm.exports.keccak_init(this.ctx, bits));
  }

  update(data) {
    assert(this.ctx);

    return wasm.safe(() => {
      const ptr = wasm.write(data, types.buffer);

      wasm.exports.keccak_update(this.ctx, ptr, data.length);
    });
  }

  final(size = 32, pad = 0x06) {
    assert(this.ctx);

    return wasm.safe(() => {
      const out = wasm.alloc(size);

      assert(wasm.exports.keccak_final(this.ctx, out, 0, size, pad));

      wasm.free(this.ctx);

      this.ctx = 0;

      return wasm.read(out, types.buffer, size);
    });
  }

  static digest(data, size = 32, pad = 0x06) {
    return wasm.safe(() => {
      const out = wasm.alloc(size);
      const ptr = wasm.write(data, types.buffer);

      wasm.exports.keccak_digest(out, ptr, data.length, size, pad);

      return wasm.read(out, types.buffer, size);
    });
  }
}

function hash(data) {
  return wasm.safe(() => {
    const out = wasm.alloc(32);
    const ptr = wasm.write(data, types.buffer);

    wasm.exports.keccak_digest(out, ptr, data.length, 32, 0x06);

    return wasm.read(out, types.buffer, 32);
  });
}

function hashHeap(data) {
  return wasm.safe(() => {
    const out = wasm.alloc(32);
    const ptr = wasm.write(data, types.buffer, 1);

    wasm.exports.keccak_digest(out, ptr, data.length, 32, 0x06);

    wasm.free(ptr);

    return wasm.read(out, types.buffer, 32);
  });
}

exports.hashSlow = hashSlow;
exports.Hash = Hash;
exports.hash = hash;
exports.hashHeap = hashHeap;
exports.open = wasm.open;
