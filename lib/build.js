/*!
 * build.js - wrapper for emcc
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 *
 * Resources:
 *   https://emscripten.org/docs/api_reference/preamble.js.html
 *   https://github.com/emscripten-core/emscripten/blob/master/src/preamble_minimal.js
 *   https://github.com/emscripten-core/emscripten/blob/master/src/postamble.js
 *   https://github.com/emscripten-core/emscripten/blob/master/src/postamble_minimal.js
 *   https://github.com/emscripten-core/emscripten/blob/master/src/settings.js
 *   https://github.com/emscripten-core/emscripten/wiki/WebAssembly-Standalone
 *   https://github.com/emscripten-core/emscripten/pull/7815
 *   https://github.com/emscripten-core/emscripten/pull/8519
 *   https://github.com/WebAssembly/design/blob/master/BinaryEncoding.md#high-level-structure
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const {basename, extname, resolve} = path;

/*
 * Constants
 */

const WASM_PAGE_SIZE = 65536;
const QUIET = process.env.BMOCHA != null;

/*
 * Build
 */

function build(items) {
  for (const options of parseAll(items)) {
    if (!QUIET) {
      console.log('Building with options:');
      console.log('');
      console.log(JSON.stringify(options, null, 2));
      console.log('');
    }

    const args = [
      ...options.sources,
      '-o', options.target,
      '-s', 'WASM=1',
      '-s', 'STANDALONE_WASM=1',
      '-s', 'WASM_BIGINT=1',
      '-s', 'INITIAL_MEMORY=' + roundUp(options.memory.initial, WASM_PAGE_SIZE),
      '-s', 'TOTAL_STACK=' + roundUp(options.memory.stack, WASM_PAGE_SIZE),
      '-s', 'EMIT_EMSCRIPTEN_METADATA=1',
      '-s', 'ERROR_ON_UNDEFINED_SYMBOLS=0',
      '-D__wasi__',
      ...options.flags
    ];

    if (!options.executable)
      args.push('-s', `EXPORTED_FUNCTIONS=${JSON.stringify(options.exports)}`);

    args.push(...options.flags);

    exec('emcc', args);

    if (options.wat)
      exec('wasm2wat', [options.target, '-o', options.wat]);

    if (options.base64) {
      const data = fs.readFileSync(options.target);
      const base = basename(options.target);

      const text = ''
        + '/*!\n'
        + ` * ${base}.js - ${base} base64 module\n`
        + ' * Compiled with wazm (https://github.com/chjj/wazm)\n'
        + ' */\n\n'
        + '\'use strict\';\n\n'
        + `module.exports = Buffer.from(${base64(data)}, 'base64');\n`;

      fs.writeFileSync(`${options.target}.js`, text);
    }
  }
}

/*
 * Options Parsing
 */

function parseAll(items) {
  const out = [];

  if (!Array.isArray(items))
    items = [items];

  for (const item of items)
    out.push(parseOptions(item));

  return out;
}

function parseOptions(options) {
  if (options == null || typeof options !== 'object')
    throw new Error('Options must be an object.');

  let {
    root,
    target,
    executable,
    base64,
    wat,
    sources,
    exports,
    memory,
    flags,
    defines,
    includes,
    settings
  } = options;

  if (root == null)
    root = process.cwd();

  if (target == null)
    target = 'out.wasm';

  if (executable == null)
    executable = false;

  if (base64 == null)
    base64 = false;

  if (wat == null)
    wat = false;

  if (sources == null)
    sources = [];

  if (exports == null)
    exports = [];

  if (memory == null)
    memory = {};

  memory = Object.assign({}, memory);

  if (memory.initial == null)
    memory.initial = 16 * 1024 * 1024;

  if (memory.stack == null)
    memory.stack = 5 * 1024 * 1024;

  if (memory.max == null)
    memory.max = null;

  if (memory.grow == null)
    memory.grow = false;

  if (flags == null)
    flags = [];

  if (defines == null)
    defines = [];

  if (includes == null)
    includes = [];

  if (settings == null)
    settings = [];

  assert(root && typeof root === 'string', '"root" must be a string.');
  assert(target && typeof target === 'string', '"target" must be a string.');
  assert(typeof executable === 'boolean', '"executable" must be a boolean.');
  assert(typeof base64 === 'boolean', '"boolean" must be a boolean.');
  assert(typeof wat === 'boolean', '"boolean" must be a boolean.');
  assert(Array.isArray(sources), '"sources" must be an array.');
  assert(Array.isArray(exports), '"exports" must be an array.');
  assert(typeof memory === 'object', '"memory" must be an object.');
  assert((memory.initial >>> 0) === memory.initial,
         '"initial" must be an int.');
  assert((memory.stack >>> 0) === memory.stack, '"stack" must be an int.');
  assert(memory.max == null || (memory.max >>> 0) === memory.max,
         '"max" must be an int.');
  assert(typeof memory.grow === 'boolean', '"grow" must be a boolean.');
  assert(Array.isArray(flags), '"flags" must be an array.');
  assert(Array.isArray(defines), '"defines" must be an array.');
  assert(Array.isArray(includes), '"includes" must be an array.');
  assert(Array.isArray(settings), '"settings" must be an array.');

  if (sources.length === 0)
    throw new Error('No sources provided.');

  if (extname(target) !== '.wasm')
    target += '.wasm';

  sources = sources.map(name => resolve(root, name));
  target = resolve(root, target);

  if (wat)
    wat = target.slice(0, -5) + '.wat';
  else
    wat = null;

  settings = settings.slice();

  if (memory.grow)  {
    settings.push('ALLOW_MEMORY_GROWTH=1');
    if (memory.max != null)
      settings.push('MAXIMUM_MEMORY=' + roundUp(memory.max, WASM_PAGE_SIZE));
  }

  flags = flags.slice();

  for (const define of defines)
    flags.push(`-D${define}`);

  for (const include of includes)
    flags.push(`-I${path.resolve(root, include)}`);

  for (const setting of settings)
    flags.push('-s', setting);

  exports = exports.slice();

  if (!executable) {
    if (!exports.includes('_malloc'))
      exports.push('_malloc');

    if (!exports.includes('_free'))
      exports.push('_free');

    exports.push('stackAlloc');
    exports.push('stackSave');
    exports.push('stackRestore');
  }

  return {
    root,
    target,
    executable,
    base64,
    wat,
    sources,
    exports,
    memory,
    flags
  };
}

/*
 * Helpers
 */

function exec(file, argv) {
  assert(typeof file === 'string');
  assert(Array.isArray(argv));

  if (!QUIET)
    console.log([file, ...argv].join(' '));

  return cp.execFileSync(file, argv, {
    stdio: 'inherit'
  });
}

function base64(raw) {
  assert(Buffer.isBuffer(raw));

  const str = raw.toString('base64');

  if (str.length < 64)
    return `'${str}'`;

  let out = '\'\\\n';

  for (let i = 0; i < str.length; i += 64) {
    out += str.substring(i, i + 64);
    out += '\\';
    out += '\n';
  }

  out += '\'';

  return out;
}

function roundUp(x, y) {
  if (x % y)
    x += y - (x % y);
  return x;
}

/*
 * Expose
 */

module.exports = build;
