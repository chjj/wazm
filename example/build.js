'use strict';

module.exports = {
  root: __dirname,
  target: 'keccak',
  sources: [
    'src/keccak.c'
  ],
  exports: [
    '_keccak_ctx_sizeof',
    '_keccak_alloc',
    '_keccak_init',
    '_keccak_update',
    '_keccak_final',
    '_keccak_digest',
    '_memcpy',
    '_memset'
  ],
  memory: {
    initial: 10 << 20,
    stack: 1 << 20,
    max: null
  },
  base64: true,
  wat: true,
  flags: [
    '-O3'
  ]
};
