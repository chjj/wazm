/*!
 * errors.js - errors for wasi
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

/**
 * WASI Exit Error
 */

class WASIExitError extends Error {
  constructor(code = 0) {
    super(`WASI Exit Code: ${code}`);

    this.name = 'WASIExitError';
    this.code = code;

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * WASI Kill Error
 */

class WASIKillError extends Error {
  constructor(signal = 'SIGABRT') {
    super(`WASI Signal: ${signal}`);

    this.name = 'WASIKillError';
    this.signal = signal;

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Assertion Error
 */

class AssertionError extends Error {
  constructor(msg, start) {
    super(msg || 'Assertion failed.');

    this.name = 'AssertionError';
    this.code = 'ERR_ASSERTION';

    if (Error.captureStackTrace)
      Error.captureStackTrace(this, start || this.constructor);
  }
}

/*
 * Assert
 */

function assert(ok, msg) {
  if (!ok)
    throw new AssertionError(msg, assert);
}

/*
 * Expose
 */

exports.WASIError = WASIError;
exports.WASIExitError = WASIExitError;
exports.WASIKillError = WASIKillError;
exports.AssertionError = AssertionError;
exports.assert = assert;
