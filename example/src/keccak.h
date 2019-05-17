/* sha3.c - an implementation of Secure Hash Algorithm 3 (Keccak).
 * based on the
 * The Keccak SHA-3 submission. Submission to NIST (Round 3), 2011
 * by Guido Bertoni, Joan Daemen, Michaël Peeters and Gilles Van Assche
 *
 * Copyright: 2013 Aleksey Kravchenko <rhash.admin@gmail.com>
 *
 * Permission is hereby granted,  free of charge,  to any person  obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction,  including without limitation
 * the rights to  use, copy, modify,  merge, publish, distribute, sublicense,
 * and/or sell copies  of  the Software,  and to permit  persons  to whom the
 * Software is furnished to do so.
 *
 * This program  is  distributed  in  the  hope  that it will be useful,  but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  Use this program  at  your own risk!
 */

#ifndef _KECCAK_H
#define _KECCAK_H

#define keccak_224_hash_size 28
#define keccak_256_hash_size 32
#define keccak_384_hash_size 48
#define keccak_512_hash_size 64
#define keccak_max_permutation_size 25
#define keccak_max_rate_in_qwords 24

typedef struct keccak_ctx {
  uint64_t hash[keccak_max_permutation_size];
  uint64_t message[keccak_max_rate_in_qwords];
  unsigned rest;
  unsigned block_size;
} keccak_ctx;

int
keccak_init(keccak_ctx *ctx, unsigned bits);

void
keccak_224_init(keccak_ctx *ctx);

void
keccak_256_init(keccak_ctx *ctx);

void
keccak_384_init(keccak_ctx *ctx);

void
keccak_512_init(keccak_ctx *ctx);

void
keccak_update(keccak_ctx *ctx,
                      const unsigned char *msg,
                      size_t size);

int
keccak_final(keccak_ctx *ctx,
                     unsigned char *result,
                     size_t *result_length,
                     size_t digest_length,
                     int pad);

#endif
