'use strict';

module.exports = {
  root: __dirname,
  output: 'keccak',
  input: [
    'src/keccak.c'
  ],
  exports: [
    'keccak_ctx_sizeof',
    'keccak_alloc',
    'keccak_init',
    'keccak_update',
    'keccak_final',
    'keccak_digest',
    'malloc',
    'memcpy',
    'memset',
    'free'
  ],
  memory: {
    total: 3,
    stack: 1,
    max: null
  },
  base64: true,
  wat: true,
  args: [
    '-O2'
  ]
};
