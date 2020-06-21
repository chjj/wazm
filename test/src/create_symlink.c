#include <assert.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

int main() {
  const char* target = "../input.txt";
  const char* linkpath = "/sandbox/subdir/test_link";
  char result[128];
  size_t len = strlen(target);
  size_t size;

  assert(0 == symlink(target, linkpath));

  size = (size_t)readlink(linkpath, result, sizeof(result));

  assert(size == len || size == len + 1);

  assert(0 == strcmp(result, target));

  FILE* file = fopen(linkpath, "r");
  assert(file != NULL);

  int c = fgetc(file);
  while (c != EOF) {
    int wrote = fputc(c, stdout);
    assert(wrote != EOF);
    c = fgetc(file);
  }

  assert(0 == unlink(linkpath));
}
