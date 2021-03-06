'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const WASM = require('../');
const binding = require('../example/binding');
const vectors = require('./data/sha3-256.json');
const WASM_DIR = path.resolve(__dirname, 'wasm');

const testsNode = [
  'cant_dotdot.wasm',
  'clock_getres.wasm',
  'create_symlink.wasm',
  'exitcode.wasm',
  'fd_prestat_get_refresh.wasm',
  'follow_symlink.wasm',
  'freopen.wasm',
  'getentropy.wasm',
  'getrusage.wasm',
  'gettimeofday.wasm',
  'link.wasm',
  'main_args.wasm',
  'notdir.wasm',
  'poll.wasm',
  'preopen_populates.wasm',
  'read_file.wasm',
  'read_file_twice.wasm',
  'stat.wasm',
  'stdin.wasm',
  'symlink_escape.wasm',
  'symlink_loop.wasm',
  'write_file.wasm'
];

// --enable-experimental-webassembly-features
const testsBrowser = [
  'clock_getres.wasm',
  'exitcode.wasm',
  'fd_prestat_get_refresh.wasm',
  'getentropy.wasm',
  // 'getrusage.wasm',
  // 'gettimeofday.wasm',
  'main_args.wasm',
  'preopen_populates.wasm'
  // 'poll.wasm'
];

describe('WASM', function() {
  const tests = process.browser ? testsBrowser : testsNode;

  for (const file of tests) {
    const target = path.resolve(WASM_DIR, file);

    it(`should run wasm (${file})`, async () => {
      const code = fs.readFileSync(target);
      const args = [];

      if (file === 'main_args.wasm') {
        args.push(
          'foo',
          '-bar',
          '--baz=value'
        );
      }

      const wasm = new WASM(code, {
        args,
        env: {
          NODE_PLATFORM: 'win32'
        },
        returnOnExit: true,
        preopens: {
          '/sandbox': path.resolve(__dirname, 'outer', 'sandbox'),
          '/tmp': path.resolve(__dirname, 'outer', 'tmp')
        }
      });

      if (process.browser)
        await wasm.open();

      if (file === 'exitcode.wasm')
        assert.strictEqual(wasm.start(), 120);
      else
        assert.strictEqual(wasm.start(), 0);
    });
  }

  it('should pass SHA3 vectors', async () => {
    if (process.browser)
      await binding.open();

    for (const [msg_, arg, key, expect] of vectors) {
      const msg = Buffer.from(msg_, 'hex');

      if (arg != null || key != null)
        continue;

      assert.strictEqual(binding.hash(msg).toString('hex'), expect);
      assert.strictEqual(binding.hashHeap(msg).toString('hex'), expect);
      assert.strictEqual(binding.hashSlow(msg).toString('hex'), expect);
      assert.strictEqual(binding.Hash.digest(msg).toString('hex'), expect);

      const hash = new binding.Hash();

      hash.init(256);
      hash.update(msg);

      assert.strictEqual(hash.final().toString('hex'), expect);
    }
  });
});
