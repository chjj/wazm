/*!
 * error.js - errors for wasi
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 */

'use strict';

const constants = require('./constants');

/**
 * WASI Error
 */

class WASIError extends Error {
  constructor(errno = constants.WASI_EINVAL) {
    super(`WASI Error: ${errno}`);

    this.name = 'WASIError';
    this.errno = (errno & 0xffff) || constants.WASI_EINVAL;

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
  }
}

/*
 * Expose
 */

module.exports = WASIError;
