'use strict';

const assert = require('assert');
const build = require('../lib/build');
const options = require('../example/build.js');
const vectors = require('./data/sha3-256.json');

describe('WASM', function() {
  it('should build wasm', () => {
    if (process.browser)
      this.skip();

    build(options);
  });

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
