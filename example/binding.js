'use strict';

const WASM = require('../');
const wasm = new WASM(require('./keccak.wasm.js'));

function hashSlow(data) {
  const ksize = wasm.sizeof('keccak_ctx');
  const save = wasm.save();
  const ctx = wasm.alloc(ksize);
  const out = wasm.alloc(32);

  try {
    wasm.throws('keccak_init', ctx, 256);
    wasm.call('keccak_update', ctx, data, data.length);
    wasm.throws('keccak_final', ctx, out, 0, 32, 0x06);
    return wasm.read(out, 32);
  } finally {
    wasm.restore(save);
  }
}

class Hash {
  constructor() {
    this.ctx = Buffer.allocUnsafe(wasm.sizeof('keccak_ctx'));
  }

  init(bits = 256) {
    const save = wasm.save();
    const ctx = wasm.alloc(this.ctx.length);

    try {
      wasm.throws('keccak_init', ctx, bits);
      wasm.copy(ctx, this.ctx);
    } finally {
      wasm.restore(save);
    }
  }

  update(data) {
    const save = wasm.save();
    const ctx = wasm.push(this.ctx);

    wasm.call('keccak_update', ctx, data, data.length);
    wasm.copy(ctx, this.ctx);
    wasm.restore(save);
  }

  final(size = 32, pad = 0x06) {
    const save = wasm.save();
    const out = wasm.alloc(size);

    try {
      wasm.throws('keccak_final', this.ctx, out, 0, size, pad);
      return wasm.read(out, size);
    } finally {
      wasm.restore(save);
    }
  }

  static digest(data, size = 32, pad = 0x06) {
    const save = wasm.save(); // In theory these are the
    const out = wasm.alloc(size); // same pointers.

    wasm.call('keccak_digest', out, data, data.length, size, pad);
    wasm.restore(save);

    return wasm.read(out, size);
  }
}

function hash(data) {
  const save = wasm.save(); // In theory these are the
  const out = wasm.alloc(32); // same pointers.

  wasm.call('keccak_digest', out, data, data.length, 32, 0x06);
  wasm.restore(save);

  return wasm.read(out, 32);
}

function hashHeap(data) {
  // This copies the data to the heap
  // first to avoid a stack overflow.
  const save = wasm.save();
  const [input, heap] = wasm.maybePush(data, save);
  const out = wasm.alloc(32);

  wasm.call('keccak_digest', out, input, data.length, 32, 0x06);
  wasm.restore(save);

  if (heap)
    wasm.free(input);

  return wasm.read(out, 32);
}

exports.hashSlow = hashSlow;
exports.Hash = Hash;
exports.hash = hash;
exports.hashHeap = hashHeap;
exports.open = wasm.open;
