# WAZM

A wrapper and accompanying preamble for emscripten's emcc. Meant for code doing
_computation_ only. If you're accessing the filesystem or doing some kind of
IO, this module is not for you (you should use the regular emscripten
preamble). If you are doing cryptography or some other form of pure
computation, this module might suit you.

## Example

Build file:

``` json
{
  "output": "keccak",
  "input": [
    "src/keccak.c"
  ],
  "exports": [
    "keccak_init",
    "keccak_update",
    "keccak_final",
    "keccak_digest"
  ],
  "memory": {
    "total": 3,
    "stack": 1,
    "max": null,
    "grow": false
  },
  "base64": true,
  "wat": true,
  "args": [
    "-O2"
  ]
}
```

On the command line:

``` bash
$ ls
./  ../  src/  build.json
$ wazm ./build.json
...
$ ls
./  ../  src/  build.json  keccak.wasm  keccak.wasm.js  keccak.wat
```

Usage:

``` js
const WASM = require('wazm');
const wasm = new WASM(require('./keccak.wasm.js'));

const data = Buffer.alloc(100, 0xaa); // Our data to hash with SHA-3.

const save = wasm.save(); // Save the stack pointer.
const out = wasm.alloc(32); // Allocate a buffer for the output.

wasm.call('keccak_digest', out, data, data.length, 32, 0x06);

const result = wasm.read(out, 32); // Read the output.

wasm.restore(save); // Restore the stack pointer.

console.log(result.toString('hex')); // Print our SHA-3 hash.
```

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`

## License

- Copyright (c) 2019, Christopher Jeffrey (MIT License).

See LICENSE for more info.
