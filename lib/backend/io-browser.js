/*!
 * io-browser.js - io for wasi
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 */

/* global performance */

'use strict';

const constants = require('./constants');
const errors = require('./errors');
const crypto = global.crypto || global.msCrypto;
const {WASIError, WASIExitError, WASIKillError} = errors;
const BigInt = global.BigInt || Number;

/*
 * Compat
 */

let hasPerf = false;

try {
  hasPerf = typeof performance.now() === 'number';
} catch (e) {
  ;
}

/*
 * Constants
 */

const USEC = BigInt(1e6);

/*
 * I/O
 */

function nanosec(time) {
  const msec = Math.floor(time);
  const rest = BigInt(Math.round((time - msec) * 1e6));
  const nsec = BigInt(msec) * USEC;

  return nsec + rest;
}

function hrtime() {
  if (hasPerf)
    return nanosec(performance.now());

  return BigInt(Date.now()) * USEC;
}

const start = hrtime();

function now(id) {
  switch (id) {
    case constants.WASI_CLOCK_REALTIME:
      return BigInt(Date.now()) * USEC;
    case constants.WASI_CLOCK_MONOTONIC:
      return hrtime();
    case constants.WASI_CLOCK_PROCESS_CPUTIME_ID:
    case constants.WASI_CLOCK_THREAD_CPUTIME_ID:
      return hrtime() - start;
    default:
      throw new WASIError(constants.WASI_EINVAL);
  }
}

function nanosleep(ns) {
  const end = hrtime() + ns;

  // eslint-disable-next-line
  while (hrtime() < end);
}

function random(data) {
  const buf = data.buffer;

  let ptr = data.byteOffset;
  let len = data.byteLength;
  let max = 65536;

  while (len > 0) {
    if (max > len)
      max = len;

    crypto.getRandomValues(new Uint8Array(buf, ptr, max));

    ptr += max;
    len -= max;
  }
}

function exit(code) {
  throw new WASIExitError(code);
}

function kill(signal) {
  throw new WASIKillError(signal);
}

/*
 * Expose
 */

exports.now = now;
exports.nanosleep = nanosleep;
exports.random = random;
exports.exit = exit;
exports.kill = kill;
exports.fs = null;
exports.path = null;
exports.posix = null;
exports.isatty = null;
exports.platform = 'browser';
