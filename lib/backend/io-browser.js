/*!
 * io-browser.js - io for wasi
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 */

/* global performance */

'use strict';

const constants = require('./constants');
const crypto = global.crypto || global.msCrypto;
const BigInt = global.BigInt || Number;

/*
 * Constants
 */

const USEC = BigInt(1e6);

/*
 * I/O
 */

function nanosec(time) {
  const msec = Math.trunc(time);
  const rest = BigInt(Math.round((time - msec) * 1e6));
  const nsec = BigInt(msec) * USEC;

  return nsec + rest;
}

function hrtime() {
  if (typeof performance === 'object' && performance && performance.now) {
    try {
      return nanosec(performance.now());
    } catch (e) {
      ;
    }
  }

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
      throw new Error('Invalid clock.');
  }
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
  return;
}

/*
 * Expose
 */

exports.now = now;
exports.random = random;
exports.exit = exit;
exports.kill = null;
exports.fs = null;
exports.path = null;
exports.isatty = null;
