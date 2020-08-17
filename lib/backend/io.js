/*!
 * io.js - io for wasi
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {isatty} = require('tty');
const constants = require('./constants');
const {WASIError} = require('./errors');
const BigInt = global.BigInt || Number;

/*
 * Lazy Loading
 */

let cp = null;
let crypto = null;
let hasSleep = true;

/*
 * Constants
 */

const USEC = BigInt(1e6);
const NSEC = BigInt(1e9);
const SPAWN_CORRECTION = 2;
const REQUIRE_CORRECTION = 3;
const SLEEP_THRESHOLD = BigInt(100) * USEC;
const WIN32 = process.platform === 'win32';

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
      throw new WASIError(constants.WASI_EINVAL);
  }
}

function nanosleep(ns) {
  const end = hrtime() + ns;

  if (!WIN32 && hasSleep && ns >= SLEEP_THRESHOLD) {
    let ms = Number(ns / USEC) - SPAWN_CORRECTION;

    if (!cp) {
      cp = require('child_process');
      ms -= REQUIRE_CORRECTION;
    }

    const sec = ms / 1000;

    try {
      cp.spawnSync('sleep', [sec.toFixed(3)], {
        stdio: 'ignore'
      });
    } catch (e) {
      hasSleep = false;
    }
  }

  // eslint-disable-next-line
  while (hrtime() < end);
}

function random(data) {
  if (!crypto)
    crypto = require('crypto');

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
exports.nanosleep = nanosleep;
exports.exit = exit;
exports.kill = kill;
exports.fs = fs;
exports.path = path;
exports.posix = path.posix;
exports.isatty = isatty;
exports.platform = process.platform;
