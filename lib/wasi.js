/*!
 * wasi.js - wasi backend for wazm
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 */

'use strict';

try {
  const {WASI} = require('wasi');
  const wasi = new WASI({});
  const symbols = Object.getOwnPropertySymbols(wasi);

  for (const symbol of symbols) {
    if (String(symbol) === 'Symbol(setMemory)') {
      WASI.kSetMemory = symbol;
      break;
    }
  }

  if (!WASI.kSetMemory)
    throw new Error();

  module.exports = WASI;
} catch (e) {
  module.exports = require('./backend/wasi');
}
