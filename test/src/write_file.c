#include <assert.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

static char* message = "hello, file!";

int main() {
  FILE* file = fopen("/tmp/hello.txt", "w");
  assert(file != NULL);

  int nwritten = fprintf(file, "%s", message);
  assert((size_t)nwritten == strlen(message));
  int r = fclose(file);
  assert(r == 0);
  assert(0 == unlink("/tmp/hello.txt"));
}
