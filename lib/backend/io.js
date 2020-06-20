/*!
 * io.js - io for wasi
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {isatty} = require('tty');
const constants = require('./constants');
const BigInt = global.BigInt || Number;

/*
 * Constants
 */

const USEC = BigInt(1e6);
const NSEC = BigInt(1e9);

/*
 * I/O
 */

function hrtime() {
  if (process.hrtime.bigint)
    return process.hrtime.bigint();

  const [sec, nsec] = process.hrtime();

  return BigInt(sec) * NSEC + BigInt(nsec);
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
  crypto.randomFillSync(data);
}

function exit(code) {
  process.exit(code);
}

function kill(signal) {
  process.kill(process.pid, signal);
}

/*
 * Expose
 */

exports.now = now;
exports.random = random;
exports.exit = exit;
exports.kill = kill;
exports.fs = fs;
exports.path = path;
exports.isatty = isatty;
