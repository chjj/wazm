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

#include <string.h>
#include <stdint.h>
#include <stdlib.h>
#include "keccak.h"

#define KECCAK_ROUNDS 24
#define KECCAK_FINALIZED 0x80000000

#define ROTL64(qword, n) ((qword) << (n) ^ ((qword) >> (64 - (n))))

#define I64(x) x##ULL

static uint64_t keccak_round_constants[KECCAK_ROUNDS] = {
  I64(0x0000000000000001), I64(0x0000000000008082),
  I64(0x800000000000808A), I64(0x8000000080008000),
  I64(0x000000000000808B), I64(0x0000000080000001),
  I64(0x8000000080008081), I64(0x8000000000008009),
  I64(0x000000000000008A), I64(0x0000000000000088),
  I64(0x0000000080008009), I64(0x000000008000000A),
  I64(0x000000008000808B), I64(0x800000000000008B),
  I64(0x8000000000008089), I64(0x8000000000008003),
  I64(0x8000000000008002), I64(0x8000000000000080),
  I64(0x000000000000800A), I64(0x800000008000000A),
  I64(0x8000000080008081), I64(0x8000000000008080),
  I64(0x0000000080000001), I64(0x8000000080008008)
};

size_t
keccak_ctx_sizeof(void) {
  return sizeof(keccak_ctx);
}

keccak_ctx *
keccak_alloc(unsigned bits) {
  return malloc(sizeof(keccak_ctx));
}

int
keccak_init(keccak_ctx *ctx, unsigned bits) {
  if (bits < 128 || bits > 512)
    return 0;

  unsigned rate = 1600 - bits * 2;

  if (rate > 1600 || (rate & 63) != 0)
    return 0;

  memset(ctx, 0, sizeof(keccak_ctx));
  ctx->block_size = rate / 8;

  return 1;
}

void
keccak_224_init(keccak_ctx *ctx) {
  keccak_init(ctx, 224);
}

void
keccak_256_init(keccak_ctx *ctx) {
  keccak_init(ctx, 256);
}

void
keccak_384_init(keccak_ctx *ctx) {
  keccak_init(ctx, 384);
}

void
keccak_512_init(keccak_ctx *ctx) {
  keccak_init(ctx, 512);
}

static void
keccak_theta(uint64_t *A) {
  unsigned int x;
  uint64_t C[5], D[5];

  for (x = 0; x < 5; x++)
    C[x] = A[x] ^ A[x + 5] ^ A[x + 10] ^ A[x + 15] ^ A[x + 20];

  D[0] = ROTL64(C[1], 1) ^ C[4];
  D[1] = ROTL64(C[2], 1) ^ C[0];
  D[2] = ROTL64(C[3], 1) ^ C[1];
  D[3] = ROTL64(C[4], 1) ^ C[2];
  D[4] = ROTL64(C[0], 1) ^ C[3];

  for (x = 0; x < 5; x++) {
    A[x] ^= D[x];
    A[x + 5] ^= D[x];
    A[x + 10] ^= D[x];
    A[x + 15] ^= D[x];
    A[x + 20] ^= D[x];
  }
}

static void
keccak_pi(uint64_t *A) {
  uint64_t A1;
  A1 = A[1];
  A[1] = A[6];
  A[6] = A[9];
  A[9] = A[22];
  A[22] = A[14];
  A[14] = A[20];
  A[20] = A[2];
  A[2] = A[12];
  A[12] = A[13];
  A[13] = A[19];
  A[19] = A[23];
  A[23] = A[15];
  A[15] = A[4];
  A[4] = A[24];
  A[24] = A[21];
  A[21] = A[8];
  A[8] = A[16];
  A[16] = A[5];
  A[5] = A[3];
  A[3] = A[18];
  A[18] = A[17];
  A[17] = A[11];
  A[11] = A[7];
  A[7] = A[10];
  A[10] = A1;
}

static void
keccak_chi(uint64_t *A) {
  int i;
  for (i = 0; i < 25; i += 5) {
    uint64_t A0 = A[0 + i], A1 = A[1 + i];
    A[0 + i] ^= ~A1 & A[2 + i];
    A[1 + i] ^= ~A[2 + i] & A[3 + i];
    A[2 + i] ^= ~A[3 + i] & A[4 + i];
    A[3 + i] ^= ~A[4 + i] & A0;
    A[4 + i] ^= ~A0 & A1;
  }
}

static void
keccak_permutation(uint64_t *state) {
  int round;
  for (round = 0; round < KECCAK_ROUNDS; round++) {
    keccak_theta(state);

    state[1] = ROTL64(state[1], 1);
    state[2] = ROTL64(state[2], 62);
    state[3] = ROTL64(state[3], 28);
    state[4] = ROTL64(state[4], 27);
    state[5] = ROTL64(state[5], 36);
    state[6] = ROTL64(state[6], 44);
    state[7] = ROTL64(state[7], 6);
    state[8] = ROTL64(state[8], 55);
    state[9] = ROTL64(state[9], 20);
    state[10] = ROTL64(state[10], 3);
    state[11] = ROTL64(state[11], 10);
    state[12] = ROTL64(state[12], 43);
    state[13] = ROTL64(state[13], 25);
    state[14] = ROTL64(state[14], 39);
    state[15] = ROTL64(state[15], 41);
    state[16] = ROTL64(state[16], 45);
    state[17] = ROTL64(state[17], 15);
    state[18] = ROTL64(state[18], 21);
    state[19] = ROTL64(state[19], 8);
    state[20] = ROTL64(state[20], 18);
    state[21] = ROTL64(state[21], 2);
    state[22] = ROTL64(state[22], 61);
    state[23] = ROTL64(state[23], 56);
    state[24] = ROTL64(state[24], 14);

    keccak_pi(state);
    keccak_chi(state);

    *state ^= keccak_round_constants[round];
  }
}

static void
keccak_process_block(uint64_t hash[25],
                             const uint64_t *block,
                             size_t block_size) {
  switch (block_size) {
    case 144: { // SHA3-224
      hash[17] ^= block[17];
    }

    case 136: { // SHA3-256
      hash[16] ^= block[16];
      hash[15] ^= block[15];
      hash[14] ^= block[14];
      hash[13] ^= block[13];
    }

    case 104: { // SHA3-384
      hash[12] ^= block[12];
      hash[11] ^= block[11];
      hash[10] ^= block[10];
      hash[9] ^= block[9];
    }

    case 72: { // SHA3-512
      hash[8] ^= block[8];
      hash[7] ^= block[7];
      hash[6] ^= block[6];
      hash[5] ^= block[5];
      hash[4] ^= block[4];
      hash[3] ^= block[3];
      hash[2] ^= block[2];
      hash[1] ^= block[1];
      hash[0] ^= block[0];
      break;
    }

    default: {
      size_t blocks = block_size / 8;
      size_t i;

      for (i = 0; i < blocks; i++)
        hash[i] ^= block[i];

      break;
    }
  }

  keccak_permutation(hash);
}

void
keccak_update(keccak_ctx *ctx,
                      const unsigned char *msg,
                      size_t size) {
  size_t index = (size_t)ctx->rest;
  size_t block_size = (size_t)ctx->block_size;

  if (ctx->rest & KECCAK_FINALIZED)
    return;

  ctx->rest = (unsigned)((ctx->rest + size) % block_size);

  if (index) {
    size_t left = block_size - index;
    memcpy((char *)ctx->message + index, msg, (size < left ? size : left));

    if (size < left)
      return;

    keccak_process_block(ctx->hash, ctx->message, block_size);
    msg += left;
    size -= left;
  }

  while (size >= block_size) {
    memcpy(ctx->message, msg, block_size);
    keccak_process_block(ctx->hash, ctx->message, block_size);
    msg += block_size;
    size -= block_size;
  }

  if (size)
    memcpy(ctx->message, msg, size);
}

int
keccak_final(keccak_ctx *ctx,
                     unsigned char *result,
                     size_t *result_length,
                     size_t digest_length,
                     int pad) {
  const size_t block_size = ctx->block_size;

  if (digest_length == 0)
    digest_length = 100 - block_size / 2;

  if (digest_length > 200)
    return 0;

  if (digest_length >= block_size)
    return 0;

  if (!(ctx->rest & KECCAK_FINALIZED)) {
    memset((char *)ctx->message + ctx->rest, 0, block_size - ctx->rest);
    ((char *)ctx->message)[ctx->rest] |= pad;
    ((char *)ctx->message)[block_size - 1] |= 0x80;

    keccak_process_block(ctx->hash, ctx->message, block_size);
    ctx->rest = KECCAK_FINALIZED;
  }

  if (result)
    memcpy(result, ctx->hash, digest_length);

  if (result_length)
    *result_length = digest_length;

  return 1;
}

void
keccak_digest(unsigned char *result,
              const unsigned char *data,
              size_t data_len,
              size_t digest_length,
              int pad) {
  keccak_ctx ctx;
  keccak_init(&ctx, 256);
  keccak_update(&ctx, data, data_len);
  keccak_final(&ctx, result, NULL, digest_length, pad);
}
