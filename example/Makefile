CC = emcc
INITIAL_MEMORY ?= 16777216
MAX_MEMORY ?= 2147483648
STACK_SIZE ?= 5242880

CFLAGS = -Wall -O3

LDFLAGS :=                            \
  -s WASM=1                           \
  -s STANDALONE_WASM=1                \
  -s WASM_BIGINT=1                    \
  -s ALLOW_MEMORY_GROWTH=1            \
  -s INITIAL_MEMORY=$(INITIAL_MEMORY) \
  -s MAXIMUM_MEMORY=$(MAX_MEMORY)     \
  -s TOTAL_STACK=$(STACK_SIZE)        \
  -s ERROR_ON_UNDEFINED_SYMBOLS=0     \
	-s EXPORTED_FUNCTIONS=@exports.json

SOURCES = src/keccak.c

all: keccak.wasm

keccak.wasm: $(SOURCES)
	$(CC) -o $@ $(CFLAGS) $(LDFLAGS) $^

clean:
	rm -f keccak.wasm

.PHONY: all clean
