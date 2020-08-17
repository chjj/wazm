/*!
 * wasi.js - wasi backend for wazm
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 */

/* global WebAssembly */

'use strict';

try {
  if (require.resolve('wasi') !== 'wasi')
    throw new Error();

  const {WASI} = require('wasi');

  if (!WASI.prototype.initialize) {
    const wasi = new WASI({});

    let kSetMemory = null;

    for (const symbol of Object.getOwnPropertySymbols(wasi)) {
      const str = String(symbol);

      if (str === 'Symbol(setMemory)' || str === 'Symbol(kSetMemory)') {
        kSetMemory = symbol;
        break;
      }
    }

    if (!kSetMemory)
      throw new Error();

    WASI.prototype.initialize = function initialize(instance) {
      if (!(instance instanceof WebAssembly.Instance))
        throw new TypeError('`instance` must be a WebAssembly.Instance.');

      const {exports} = instance;

      if (exports._start !== undefined)
        throw new Error('Instance contains a _start export.');

      if (exports._initialize !== undefined) {
        if (typeof exports._initialize !== 'function')
          throw new Error('Instance does not contain an _initialize export.');
      }

      if (!(exports.memory instanceof WebAssembly.Memory))
        throw new Error('Instance must export `memory`.');

      this[kSetMemory](exports.memory);

      if (exports._initialize)
        exports._initialize();
    };
  }

  module.exports = WASI;
} catch (e) {
  module.exports = require('./backend/wasi');
}
