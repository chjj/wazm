'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const build = require('../lib/build');
const WASM = require('../lib/wazm');
const options = require('../example/build.js');
const vectors = require('./data/sha3-256.json');

const tests = [
  'cant_dotdot.c',
  'clock_getres.c',
  'exitcode.c',
  'fd_prestat_get_refresh.c',
  'follow_symlink.c',
  // 'getentropy.c',
  // 'getrusage.c',
  'gettimeofday.c',
  'notdir.c',
  // 'poll.c',
  'preopen_populates.c',
  'read_file.c',
  'read_file_twice.c',
  // 'stat.c',
  // 'stdin.c',
  'symlink_escape.c',
  'symlink_loop.c',
  'write_file.c'
];

describe('WASM', function() {
  it('should build wasm (keccak.c)', () => {
    if (process.browser)
      this.skip();

    build(options);
  });

  for (const file of tests) {
    const target = path.resolve(__dirname, 'wasm', file.slice(0, -2));

    it(`should build wasm (${file})`, () => {
      if (process.browser)
        this.skip();

      build({
        root: `${__dirname}/src`,
        target,
        executable: true,
        sources: [file],
        defines: ['ENOTCAPABLE=76'],
        flags: ['-O3']
      });
    });

    it(`should run wasm (${file})`, async () => {
      const code = fs.readFileSync(`${target}.wasm`);

      const wasm = new WASM(code, {
        returnOnExit: true,
        preopen: {
          '/sandbox': path.resolve(__dirname, 'outer', 'sandbox'),
          '/tmp': os.tmpdir()
        }
      });

      if (process.browser)
        await wasm.open();

      wasm.start();
    });
  }

  describe('SHA3', () => {
    const binding = require('../example/binding');

    it('should wait for context', async () => {
      if (!process.browser)
        this.skip();

      await binding.open();
    });

    for (const [msg_, arg, key, expect] of vectors) {
      const msg = Buffer.from(msg_, 'hex');
      const text = expect.slice(0, 32) + '...';

      if (arg != null || key != null)
        continue;

      it(`should get SHA3 hash of ${text}`, () => {
        assert.strictEqual(binding.hash(msg).toString('hex'), expect);
        assert.strictEqual(binding.hashHeap(msg).toString('hex'), expect);
        assert.strictEqual(binding.hashSlow(msg).toString('hex'), expect);
        assert.strictEqual(binding.Hash.digest(msg).toString('hex'), expect);

        const hash = new binding.Hash();
        hash.init(256);
        hash.update(msg);

        assert.strictEqual(hash.final().toString('hex'), expect);
      });
    }
  });
});
