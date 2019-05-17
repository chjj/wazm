'use strict';

const assert = require('assert');
const binding = require('./binding');
const SHA3 = require('bcrypto/lib/sha3');

const preimage = Buffer.alloc(64, 0xaa);

// Sanity check.
assert(binding.hash(preimage).equals(SHA3.digest(preimage)));

{
  const now = Date.now();

  for (let i = 0; i < 1000000; i++)
    binding.hash(preimage);

  console.log('binding.hash: %d', 1000000 / ((Date.now() - now) / 1000));
}

{
  const now = Date.now();

  for (let i = 0; i < 1000000; i++)
    binding.hashHeap(preimage);

  console.log('binding.hashHeap: %d', 1000000 / ((Date.now() - now) / 1000));
}

{
  const now = Date.now();

  for (let i = 0; i < 1000000; i++)
    SHA3.digest(preimage);

  console.log('SHA3.digest: %d', 1000000 / ((Date.now() - now) / 1000));
}

{
  const now = Date.now();

  for (let i = 0; i < 1000000; i++) {
    const hash = new binding.Hash();
    hash.init(256);
    hash.update(preimage);
    hash.final(32);
  }

  console.log('binding.Hash: %d', 1000000 / ((Date.now() - now) / 1000));
}

{
  const now = Date.now();

  for (let i = 0; i < 1000000; i++) {
    const hash = new SHA3();
    hash.init(256);
    hash.update(preimage);
    hash.final(32);
  }

  console.log('SHA3: %d', 1000000 / ((Date.now() - now) / 1000));
}
