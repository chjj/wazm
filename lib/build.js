/*!
 * build.js - wrapper for emcc
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 *
 * Resources:
 *   https://emscripten.org/docs/api_reference/preamble.js.html
 *   https://github.com/emscripten-core/emscripten/blob/master/src/preamble.js
 *   https://github.com/emscripten-core/emscripten/blob/incoming/src/preamble_minimal.js
 *   https://github.com/emscripten-core/emscripten/blob/incoming/src/postamble.js
 *   https://github.com/emscripten-core/emscripten/blob/incoming/src/postamble_minimal.js
 *   https://github.com/emscripten-core/emscripten/blob/incoming/src/settings.js
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

/*
 * Build
 */

function build(options) {
  options = parseOptions(options);

  console.log('Building with options:');
  console.log('');
  console.log(JSON.stringify(options, null, 2));
  console.log('');

  exec('emcc', [
    ...options.files,
    '-o', options.target,
    '-s', 'WASM=1',
    '-s', 'TOTAL_MEMORY=' + (options.memory.total * WASM_PAGE_SIZE),
    '-s', 'TOTAL_STACK=' + (options.memory.stack * WASM_PAGE_SIZE),
    '-s', 'EMIT_EMSCRIPTEN_METADATA=1',
    '-s', 'ENVIRONMENT=node',
    '-s', options.symbols.length > 0
      ? `EXPORTED_FUNCTIONS=${JSON.stringify(options.symbols)}`
      : 'EXPORT_ALL=1',
    ...options.args
  ]);

  ensureMetadata(options);

  if (options.wat)
    exec('wasm2wat', [options.wasm, '-o', options.wat]);

  fs.unlinkSync(options.target);

  if (options.base64) {
    const data = fs.readFileSync(options.wasm);
    const base = basename(options.wasm);

    const text = ''
      + '/*!\n'
      + ` * ${base}.js - ${base} base64 module\n`
      + ' * Compiled with wazm (https://github.com/chjj/wazm)\n'
      + ' */\n\n'
      + '\'use strict\';\n\n'
      + `module.exports = Buffer.from(${base64(data)}, 'base64');\n`;

    fs.writeFileSync(`${options.wasm}.js`, text);
  }
}

/*
 * Metadata
 */

function ensureMetadata(options) {
  assert(options != null && typeof options === 'object');

  const data = fs.readFileSync(options.wasm);

  // https://github.com/emscripten-core/emscripten/wiki/WebAssembly-Standalone
  // https://github.com/emscripten-core/emscripten/pull/7815
  // https://github.com/emscripten-core/emscripten/pull/8519
  if (data.length < 4 + 4 + 1 + 1 + 1 + 10)
    throw new Error('Invalid binary.');

  const magic = data.readUInt32LE(0);
  const version = data.readUInt32LE(4);
  const code = data[8];

  assert(code === 0);

  // Get (name-size, name, contents) size.
  let [size, off] = delebify(data, 9);

  assert(off + size <= data.length);

  // Get name size.
  const nameSize = data[off];

  off += 1;

  assert(off + nameSize <= data.length);

  // Slice name.
  const name = data.toString('binary', off, off + nameSize);

  off += nameSize;

  if (name !== 'emscripten_metadata') // 19 bytes.
    throw new Error('Invalid binary.');

  // Get the contents size.
  size -= (1 + nameSize);

  assert(off + size <= data.length);

  const params = {
    MAGIC: magic,
    VERSION: version,
    METADATA_MAJOR: 0,
    METADATA_MINOR: 0,
    ABI_MAJOR: 0,
    ABI_MINOR: 0,
    TOTAL_MEMORY: 0,
    TABLE_SIZE: 0,
    GLOBAL_BASE: 0,
    DYNAMIC_BASE: 0,
    DYNAMICTOP_PTR: 0,
    TEMP_DOUBLE_PTR: 0,
    // Extras.
    STACK_BASE: 0,
    TOTAL_STACK: 0,
    ALLOW_MEMORY_GROWTH: 0,
    WASM_MEM_MAX: 0
  };

  [params.METADATA_MAJOR, off] = delebify(data, off);
  [params.METADATA_MINOR, off] = delebify(data, off);

  [params.ABI_MAJOR, off] = delebify(data, off);
  [params.ABI_MINOR, off] = delebify(data, off);
  [params.TOTAL_MEMORY, off] = delebify(data, off);
  [params.TABLE_SIZE, off] = delebify(data, off);

  const js = fs.readFileSync(options.target, 'utf8');

  if ((params.METADATA_MAJOR | params.METADATA_MINOR) !== 0) {
    // Version >=0.1 only.
    [params.GLOBAL_BASE, off] = delebify(data, off);
    [params.DYNAMIC_BASE, off] = delebify(data, off);
    [params.DYNAMICTOP_PTR, off] = delebify(data, off);
    [params.TEMP_DOUBLE_PTR, off] = delebify(data, off);
  } else {
    params.TOTAL_MEMORY = options.memory.total;
    params.GLOBAL_BASE = 1024;
    params.DYNAMIC_BASE = /DYNAMIC_BASE\s*=\s*(\d+)/.exec(js)[1] >>> 0;
    params.DYNAMICTOP_PTR = /DYNAMICTOP_PTR\s*=\s*(\d+)/.exec(js)[1] >>> 0;
    params.TEMP_DOUBLE_PTR = /tempDoublePtr\s*=\s*(\d+)/.exec(js)[1] >>> 0;
  }

  // Extras.
  params.STACK_BASE = /STACK_BASE\s*=\s*(\d+)/.exec(js)[1] >>> 0;
  params.TOTAL_STACK = options.memory.stack;
  params.ALLOW_MEMORY_GROWTH =
    options.args.includes('ALLOW_MEMORY_GROWTH=1') >>> 0;

  for (const arg of options.args) {
    if (arg.startsWith('WASM_MEM_MAX=')) {
      params.WASM_MEM_MAX = arg.substring(13) >>> 0;
      params.WASM_MEM_MAX = (params.WASM_MEM_MAX / WASM_PAGE_SIZE) >>> 0;
    }
  }

  // Skip past the section.
  [size, off] = delebify(data, 9);
  off += size;

  const before = data.slice(0, 9);
  const after = data.slice(off);

  // Our own custom version (0.1 is the current standard).
  params.METADATA_MAJOR = 0x7761;
  params.METADATA_MINOR = 0x7a6d;

  const slab = Buffer.concat([
    Buffer.from([0x13]),
    Buffer.from('emscripten_metadata', 'binary'),
    lebify(params.METADATA_MAJOR),
    lebify(params.METADATA_MINOR),
    lebify(params.ABI_MAJOR),
    lebify(params.ABI_MINOR),
    lebify(params.TOTAL_MEMORY),
    lebify(params.TABLE_SIZE),
    lebify(params.GLOBAL_BASE),
    lebify(params.DYNAMIC_BASE),
    lebify(params.DYNAMICTOP_PTR),
    lebify(params.TEMP_DOUBLE_PTR),
    // Extras.
    lebify(params.STACK_BASE),
    lebify(params.TOTAL_STACK),
    lebify(params.ALLOW_MEMORY_GROWTH),
    lebify(params.WASM_MEM_MAX)
  ]);

  const raw = Buffer.concat([
    before,
    lebify(slab.length),
    slab,
    after
  ]);

  fs.writeFileSync(options.wasm, raw);

  console.log('');
  console.log('Wrote metadata:');
  console.log('');
  console.log(JSON.stringify(params, null, 2));
  console.log('');
}

/*
 * Options Parsing
 */

function parseOptions(options) {
  if (options == null || typeof options !== 'object')
    throw new Error('Options must be an object.');

  let {
    root,
    input,
    output,
    exports,
    memory,
    base64,
    wat,
    args,
    flags
  } = options;

  if (root == null)
    root = process.cwd();

  if (input == null)
    input = [];

  if (output == null)
    output = 'out.wasm';

  if (exports == null)
    exports = [];

  if (memory == null)
    memory = {};

  if (memory.total == null)
    memory.total = 3;

  if (memory.stack == null)
    memory.stack = 1;

  if (memory.max == null)
    memory.max = null;

  if (memory.grow == null)
    memory.grow = false;

  if (base64 == null)
    base64 = false;

  if (wat == null)
    wat = false;

  if (args == null)
    args = [];

  if (flags == null)
    flags = [];

  assert(root && typeof root === 'string', '"root" must be a string.');
  assert(Array.isArray(input), '"input" must be an array.');
  assert(output && typeof output === 'string', '"output" must be a string.');
  assert(Array.isArray(exports), '"exports" must be an array.');
  assert(typeof memory === 'object', '"memory" must be an object.');
  assert((memory.total >>> 0) === memory.total, '"total" must be an int.');
  assert((memory.stack >>> 0) === memory.stack, '"stack" must be an int.');
  assert(memory.max == null || (memory.max >>> 0) === memory.max,
         '"max" must be an int.');
  assert(typeof memory.grow === 'boolean', '"grow" must be a boolean.');
  assert(typeof base64 === 'boolean', '"boolean" must be a boolean.');
  assert(typeof wat === 'boolean', '"boolean" must be a boolean.');
  assert(Array.isArray(flags), '"flags" must be an array.');

  if (input.length === 0)
    throw new Error('No inputs provided.');

  const files = input.map(name => resolve(root, name));
  const target = resolve(root, replace(output, '.js'));
  const wasm = replace(target, '.wasm');

  if (wat)
    wat = replace(target, '.wat');
  else
    wat = null;

  const symbols = exports.map(name => `_${name}`);

  if (memory.grow)  {
    flags.push('ALLOW_MEMORY_GROWTH=1');
    if (memory.max != null)
      flags.push('WASM_MEM_MAX=' + (memory.max * WASM_PAGE_SIZE));
  }

  for (const flag of flags)
    args.push('-s', flag);

  if (args.includes('-Os') || args.includes('-Oz') || args.includes('-O3'))
    throw new Error('Cannot use high optimization modes (yet).');

  return {
    root,
    input,
    files,
    output,
    target,
    wasm,
    wat,
    exports,
    symbols,
    memory,
    base64,
    args
  };
}

/*
 * Helpers
 */

function exec(file, argv) {
  assert(typeof file === 'string');
  assert(Array.isArray(argv));

  console.log([file, ...argv].join(' '));

  return cp.execFileSync(file, argv, {
    stdio: 'inherit'
  });
}

function replace(file, to) {
  assert(typeof file === 'string');
  assert(typeof to === 'string');

  const ext = extname(file);

  if (ext === '')
    return `${file}${to}`;

  return `${file.slice(0, -ext.length)}${to}`;
}

function lebify(x) {
  assert(Number.isSafeInteger(x) && x >= 0);

  const ret = [];

  for (;;) {
    let byte = x & 127;

    // x >>>= 7;
    x /= 2 ** 7;
    x = Math.floor(x);

    const more = x !== 0;

    if (more)
      byte |= 128;

    ret.push(byte);

    if (!more)
      break;
  }

  return Buffer.from(ret);
}

function delebify(buf, offset) {
  assert(Buffer.isBuffer(buf));
  assert((offset >>> 0) === offset);

  let result = 0;
  let shift = 0;

  for (;;) {
    assert(offset < buf.length);

    const byte = buf[offset];

    offset += 1;
    // result |= (byte & 0x7f) << shift;
    result += (byte & 0x7f) * (2 ** shift);

    if (!(byte & 0x80))
      break;

    shift += 7;
  }

  return [result, offset];
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

/*
 * Expose
 */

module.exports = build;
