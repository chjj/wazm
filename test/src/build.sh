#!/bin/bash

cd `dirname "$0"`

if ! test -d "$1"; then
  echo 'Please pass the location of your wasi-sdk directory.' >& 2
  exit 1
fi

SDK=$1
CC=${SDK}/bin/clang
LD=${SDK}/bin/wasm-ld
SYSROOT=${SDK}/share/wasi-sysroot
LD_PATH=${SDK}/share/wasi-sysroot/lib/wasm32-wasi
BUILTINS=${SDK}/lib/clang/10.0.0/lib/wasi

SOURCES=(
  'cant_dotdot'
  'clock_getres'
  'create_symlink'
  'exitcode'
  'fd_prestat_get_refresh'
  'follow_symlink'
  'freopen'
  'getentropy'
  'getrusage'
  'gettimeofday'
  'link'
  'main_args'
  'notdir'
  'poll'
  'preopen_populates'
  'read_file'
  'read_file_twice'
  'stat'
  'stdin'
  'symlink_escape'
  'symlink_loop'
  'write_file'
)

CFLAGS=(
  '-std=gnu11'
  '-Wall'
  '-Wextra'
  '--target=wasm32-wasi'
  "--sysroot=${SYSROOT}"
  '-s'
  '-Wl,-z' '-Wl,stack-size=5242880'
  '-Wl,--initial-memory=16777216'
  '-Wl,--max-memory=2147483648'
)

set -ex

for file in "${SOURCES[@]}"; do
  "$CC" -o "../wasm/${file}.wasm" "${CFLAGS[@]}" "${file}.c"
done
