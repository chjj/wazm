SDK ?= /opt/wasi-sdk
CC = $(SDK)/bin/clang
SYSROOT = $(SDK)/share/wasi-sysroot
TARGET = wasm32-wasi

OBJ = $(patsubst src/%.c, wasm/%.wasm, $(wildcard src/*.c))

all: $(OBJ)

wasm/%.wasm : src/%.c
	$(CC) $< --target=$(TARGET) --sysroot=$(SYSROOT) -s -o $@

.PHONY clean:
	rm -f $(OBJ)
