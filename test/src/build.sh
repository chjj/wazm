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

sources=(
  'cant_dotdot'
  'clock_getres'
  'exitcode'
  'fd_prestat_get_refresh'
  'follow_symlink'
  'getentropy'
  'getrusage'
  'gettimeofday'
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

cflags=(
  '-std=gnu11'
  '-Wall'
  '-Wextra'
  '--target=wasm32-wasi'
  '--sysroot' "${SYSROOT}"
)

ldflags=(
  '--allow-undefined'
  '--strip-debug'
  '-z' 'stack-size=5242880'
  '--initial-memory=16777216'
  '--max-memory=2147483648'
  '--global-base=1024'
  '--error-limit=0'
)

set -ex

for file in "${sources[@]}"; do
  "$CC" -o "${file}.o" -c "${cflags[@]}" "${file}.c"
  "$LD" -o "../wasm/${file}.wasm" "${ldflags[@]}" \
    -L "${LD_PATH}" -lc "${file}.o" "${LD_PATH}/crt1.o"
done

rm -f *.o
