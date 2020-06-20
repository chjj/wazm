/*!
 * constants.js - constants for wasi
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 *
 * Parts of this software are based on devsnek/node-wasi:
 *   Copyright (c) 2019, Gus Caplan (MIT License).
 *   https://github.com/devsnek/node-wasi
 *
 * Resources:
 *   https://github.com/devsnek/node-wasi/blob/master/src/index.js
 */

'use strict';

const BigInt = global.BigInt || Number;

/*
 * Constants
 */

const constants = {
  // Errors
  WASI_ESUCCESS: 0,
  WASI_E2BIG: 1,
  WASI_EACCES: 2,
  WASI_EADDRINUSE: 3,
  WASI_EADDRNOTAVAIL: 4,
  WASI_EAFNOSUPPORT: 5,
  WASI_EAGAIN: 6,
  WASI_EALREADY: 7,
  WASI_EBADF: 8,
  WASI_EBADMSG: 9,
  WASI_EBUSY: 10,
  WASI_ECANCELED: 11,
  WASI_ECHILD: 12,
  WASI_ECONNABORTED: 13,
  WASI_ECONNREFUSED: 14,
  WASI_ECONNRESET: 15,
  WASI_EDEADLK: 16,
  WASI_EDESTADDRREQ: 17,
  WASI_EDOM: 18,
  WASI_EDQUOT: 19,
  WASI_EEXIST: 20,
  WASI_EFAULT: 21,
  WASI_EFBIG: 22,
  WASI_EHOSTUNREACH: 23,
  WASI_EIDRM: 24,
  WASI_EILSEQ: 25,
  WASI_EINPROGRESS: 26,
  WASI_EINTR: 27,
  WASI_EINVAL: 28,
  WASI_EIO: 29,
  WASI_EISCONN: 30,
  WASI_EISDIR: 31,
  WASI_ELOOP: 32,
  WASI_EMFILE: 33,
  WASI_EMLINK: 34,
  WASI_EMSGSIZE: 35,
  WASI_EMULTIHOP: 36,
  WASI_ENAMETOOLONG: 37,
  WASI_ENETDOWN: 38,
  WASI_ENETRESET: 39,
  WASI_ENETUNREACH: 40,
  WASI_ENFILE: 41,
  WASI_ENOBUFS: 42,
  WASI_ENODEV: 43,
  WASI_ENOENT: 44,
  WASI_ENOEXEC: 45,
  WASI_ENOLCK: 46,
  WASI_ENOLINK: 47,
  WASI_ENOMEM: 48,
  WASI_ENOMSG: 49,
  WASI_ENOPROTOOPT: 50,
  WASI_ENOSPC: 51,
  WASI_ENOSYS: 52,
  WASI_ENOTCONN: 53,
  WASI_ENOTDIR: 54,
  WASI_ENOTEMPTY: 55,
  WASI_ENOTRECOVERABLE: 56,
  WASI_ENOTSOCK: 57,
  WASI_ENOTSUP: 58,
  WASI_ENOTTY: 59,
  WASI_ENXIO: 60,
  WASI_EOVERFLOW: 61,
  WASI_EOWNERDEAD: 62,
  WASI_EPERM: 63,
  WASI_EPIPE: 64,
  WASI_EPROTO: 65,
  WASI_EPROTONOSUPPORT: 66,
  WASI_EPROTOTYPE: 67,
  WASI_ERANGE: 68,
  WASI_EROFS: 69,
  WASI_ESPIPE: 70,
  WASI_ESRCH: 71,
  WASI_ESTALE: 72,
  WASI_ETIMEDOUT: 73,
  WASI_ETXTBSY: 74,
  WASI_EXDEV: 75,
  WASI_ENOTCAPABLE: 76,

  // Signals
  WASI_SIGABRT: 0,
  WASI_SIGALRM: 1,
  WASI_SIGBUS: 2,
  WASI_SIGCHLD: 3,
  WASI_SIGCONT: 4,
  WASI_SIGFPE: 5,
  WASI_SIGHUP: 6,
  WASI_SIGILL: 7,
  WASI_SIGINT: 8,
  WASI_SIGKILL: 9,
  WASI_SIGPIPE: 10,
  WASI_SIGQUIT: 11,
  WASI_SIGSEGV: 12,
  WASI_SIGSTOP: 13,
  WASI_SIGTERM: 14,
  WASI_SIGTRAP: 15,
  WASI_SIGTSTP: 16,
  WASI_SIGTTIN: 17,
  WASI_SIGTTOU: 18,
  WASI_SIGURG: 19,
  WASI_SIGUSR1: 20,
  WASI_SIGUSR2: 21,
  WASI_SIGVTALRM: 22,
  WASI_SIGXCPU: 23,
  WASI_SIGXFSZ: 24,

  // File Types
  WASI_FILETYPE_UNKNOWN: 0,
  WASI_FILETYPE_BLOCK_DEVICE: 1,
  WASI_FILETYPE_CHARACTER_DEVICE: 2,
  WASI_FILETYPE_DIRECTORY: 3,
  WASI_FILETYPE_REGULAR_FILE: 4,
  WASI_FILETYPE_SOCKET_DGRAM: 5,
  WASI_FILETYPE_SOCKET_STREAM: 6,
  WASI_FILETYPE_SYMBOLIC_LINK: 7,

  // FD Flags
  WASI_FDFLAG_APPEND: 0x0001,
  WASI_FDFLAG_DSYNC: 0x0002,
  WASI_FDFLAG_NONBLOCK: 0x0004,
  WASI_FDFLAG_RSYNC: 0x0008,
  WASI_FDFLAG_SYNC: 0x0010,

  // Rights
  WASI_RIGHT_FD_DATASYNC: 0x0000000000000001n,
  WASI_RIGHT_FD_READ: 0x0000000000000002n,
  WASI_RIGHT_FD_SEEK: 0x0000000000000004n,
  WASI_RIGHT_FD_FDSTAT_SET_FLAGS: 0x0000000000000008n,
  WASI_RIGHT_FD_SYNC: 0x0000000000000010n,
  WASI_RIGHT_FD_TELL: 0x0000000000000020n,
  WASI_RIGHT_FD_WRITE: 0x0000000000000040n,
  WASI_RIGHT_FD_ADVISE: 0x0000000000000080n,
  WASI_RIGHT_FD_ALLOCATE: 0x0000000000000100n,
  WASI_RIGHT_PATH_CREATE_DIRECTORY: 0x0000000000000200n,
  WASI_RIGHT_PATH_CREATE_FILE: 0x0000000000000400n,
  WASI_RIGHT_PATH_LINK_SOURCE: 0x0000000000000800n,
  WASI_RIGHT_PATH_LINK_TARGET: 0x0000000000001000n,
  WASI_RIGHT_PATH_OPEN: 0x0000000000002000n,
  WASI_RIGHT_FD_READDIR: 0x0000000000004000n,
  WASI_RIGHT_PATH_READLINK: 0x0000000000008000n,
  WASI_RIGHT_PATH_RENAME_SOURCE: 0x0000000000010000n,
  WASI_RIGHT_PATH_RENAME_TARGET: 0x0000000000020000n,
  WASI_RIGHT_PATH_FILESTAT_GET: 0x0000000000040000n,
  WASI_RIGHT_PATH_FILESTAT_SET_SIZE: 0x0000000000080000n,
  WASI_RIGHT_PATH_FILESTAT_SET_TIMES: 0x0000000000100000n,
  WASI_RIGHT_FD_FILESTAT_GET: 0x0000000000200000n,
  WASI_RIGHT_FD_FILESTAT_SET_SIZE: 0x0000000000400000n,
  WASI_RIGHT_FD_FILESTAT_SET_TIMES: 0x0000000000800000n,
  WASI_RIGHT_PATH_SYMLINK: 0x0000000001000000n,
  WASI_RIGHT_PATH_REMOVE_DIRECTORY: 0x0000000002000000n,
  WASI_RIGHT_PATH_UNLINK_FILE: 0x0000000004000000n,
  WASI_RIGHT_POLL_FD_READWRITE: 0x0000000008000000n,
  WASI_RIGHT_SOCK_SHUTDOWN: 0x0000000010000000n,

  // Rights Fields
  RIGHTS_ALL: BigInt(0),
  RIGHTS_BLOCK_DEVICE_BASE: BigInt(0),
  RIGHTS_BLOCK_DEVICE_INHERITING: BigInt(0),
  RIGHTS_CHARACTER_DEVICE_BASE: BigInt(0),
  RIGHTS_CHARACTER_DEVICE_INHERITING: BigInt(0),
  RIGHTS_REGULAR_FILE_BASE: BigInt(0),
  RIGHTS_REGULAR_FILE_INHERITING: BigInt(0),
  RIGHTS_DIRECTORY_BASE: BigInt(0),
  RIGHTS_DIRECTORY_INHERITING: BigInt(0),
  RIGHTS_SOCKET_BASE: BigInt(0),
  RIGHTS_SOCKET_INHERITING: BigInt(0),
  RIGHTS_TTY_BASE: BigInt(0),
  RIGHTS_TTY_INHERITING: BigInt(0),

  // Clocks
  WASI_CLOCK_REALTIME: 0,
  WASI_CLOCK_MONOTONIC: 1,
  WASI_CLOCK_PROCESS_CPUTIME_ID: 2,
  WASI_CLOCK_THREAD_CPUTIME_ID: 3,

  // Event Types
  WASI_EVENTTYPE_CLOCK: 0,
  WASI_EVENTTYPE_FD_READ: 1,
  WASI_EVENTTYPE_FD_WRITE: 2,

  // File Stats
  WASI_FILESTAT_SET_ATIM: 1 << 0,
  WASI_FILESTAT_SET_ATIM_NOW: 1 << 1,
  WASI_FILESTAT_SET_MTIM: 1 << 2,
  WASI_FILESTAT_SET_MTIM_NOW: 1 << 3,

  // Open Flags
  WASI_O_CREAT: 1 << 0,
  WASI_O_DIRECTORY: 1 << 1,
  WASI_O_EXCL: 1 << 2,
  WASI_O_TRUNC: 1 << 3,

  // Preopen Types
  WASI_PREOPENTYPE_DIR: 0,

  // Dir Cookies
  WASI_DIRCOOKIE_START: 0,

  // File Descriptors
  WASI_STDIN_FILENO: 0,
  WASI_STDOUT_FILENO: 1,
  WASI_STDERR_FILENO: 2,

  // Whence
  WASI_WHENCE_CUR: 0,
  WASI_WHENCE_END: 1,
  WASI_WHENCE_SET: 2,

  // Advice
  WASI_ADVICE_NORMAL: 0,
  WASI_ADVICE_SEQUENTIAL: 1,
  WASI_ADVICE_RANDOM: 2,
  WASI_ADVICE_WILLNEED: 3,
  WASI_ADVICE_DONTNEED: 4,
  WASI_ADVICE_NOREUSE: 5,

  // Lookup
  WASI_LOOKUP_SYMLINK_FOLLOW: 1 << 0
};

constants.RIGHTS_ALL = constants.WASI_RIGHT_FD_DATASYNC
                     | constants.WASI_RIGHT_FD_READ
                     | constants.WASI_RIGHT_FD_SEEK
                     | constants.WASI_RIGHT_FD_FDSTAT_SET_FLAGS
                     | constants.WASI_RIGHT_FD_SYNC
                     | constants.WASI_RIGHT_FD_TELL
                     | constants.WASI_RIGHT_FD_WRITE
                     | constants.WASI_RIGHT_FD_ADVISE
                     | constants.WASI_RIGHT_FD_ALLOCATE
                     | constants.WASI_RIGHT_PATH_CREATE_DIRECTORY
                     | constants.WASI_RIGHT_PATH_CREATE_FILE
                     | constants.WASI_RIGHT_PATH_LINK_SOURCE
                     | constants.WASI_RIGHT_PATH_LINK_TARGET
                     | constants.WASI_RIGHT_PATH_OPEN
                     | constants.WASI_RIGHT_FD_READDIR
                     | constants.WASI_RIGHT_PATH_READLINK
                     | constants.WASI_RIGHT_PATH_RENAME_SOURCE
                     | constants.WASI_RIGHT_PATH_RENAME_TARGET
                     | constants.WASI_RIGHT_PATH_FILESTAT_GET
                     | constants.WASI_RIGHT_PATH_FILESTAT_SET_SIZE
                     | constants.WASI_RIGHT_PATH_FILESTAT_SET_TIMES
                     | constants.WASI_RIGHT_FD_FILESTAT_GET
                     | constants.WASI_RIGHT_FD_FILESTAT_SET_TIMES
                     | constants.WASI_RIGHT_FD_FILESTAT_SET_SIZE
                     | constants.WASI_RIGHT_PATH_SYMLINK
                     | constants.WASI_RIGHT_PATH_UNLINK_FILE
                     | constants.WASI_RIGHT_PATH_REMOVE_DIRECTORY
                     | constants.WASI_RIGHT_POLL_FD_READWRITE
                     | constants.WASI_RIGHT_SOCK_SHUTDOWN;

constants.RIGHTS_BLOCK_DEVICE_BASE = constants.RIGHTS_ALL;
constants.RIGHTS_BLOCK_DEVICE_INHERITING = constants.RIGHTS_ALL;

constants.RIGHTS_CHARACTER_DEVICE_BASE = constants.RIGHTS_ALL;
constants.RIGHTS_CHARACTER_DEVICE_INHERITING = constants.RIGHTS_ALL;

constants.RIGHTS_REGULAR_FILE_BASE = constants.WASI_RIGHT_FD_DATASYNC
                                   | constants.WASI_RIGHT_FD_READ
                                   | constants.WASI_RIGHT_FD_SEEK
                                   | constants.WASI_RIGHT_FD_FDSTAT_SET_FLAGS
                                   | constants.WASI_RIGHT_FD_SYNC
                                   | constants.WASI_RIGHT_FD_TELL
                                   | constants.WASI_RIGHT_FD_WRITE
                                   | constants.WASI_RIGHT_FD_ADVISE
                                   | constants.WASI_RIGHT_FD_ALLOCATE
                                   | constants.WASI_RIGHT_FD_FILESTAT_GET
                                   | constants.WASI_RIGHT_FD_FILESTAT_SET_SIZE
                                   | constants.WASI_RIGHT_FD_FILESTAT_SET_TIMES
                                   | constants.WASI_RIGHT_POLL_FD_READWRITE;

constants.RIGHTS_REGULAR_FILE_INHERITING = BigInt(0);

constants.RIGHTS_DIRECTORY_BASE = constants.WASI_RIGHT_FD_FDSTAT_SET_FLAGS
                                | constants.WASI_RIGHT_FD_SYNC
                                | constants.WASI_RIGHT_FD_ADVISE
                                | constants.WASI_RIGHT_PATH_CREATE_DIRECTORY
                                | constants.WASI_RIGHT_PATH_CREATE_FILE
                                | constants.WASI_RIGHT_PATH_LINK_SOURCE
                                | constants.WASI_RIGHT_PATH_LINK_TARGET
                                | constants.WASI_RIGHT_PATH_OPEN
                                | constants.WASI_RIGHT_FD_READDIR
                                | constants.WASI_RIGHT_PATH_READLINK
                                | constants.WASI_RIGHT_PATH_RENAME_SOURCE
                                | constants.WASI_RIGHT_PATH_RENAME_TARGET
                                | constants.WASI_RIGHT_PATH_FILESTAT_GET
                                | constants.WASI_RIGHT_PATH_FILESTAT_SET_SIZE
                                | constants.WASI_RIGHT_PATH_FILESTAT_SET_TIMES
                                | constants.WASI_RIGHT_FD_FILESTAT_GET
                                | constants.WASI_RIGHT_FD_FILESTAT_SET_TIMES
                                | constants.WASI_RIGHT_PATH_SYMLINK
                                | constants.WASI_RIGHT_PATH_UNLINK_FILE
                                | constants.WASI_RIGHT_PATH_REMOVE_DIRECTORY
                                | constants.WASI_RIGHT_POLL_FD_READWRITE;

constants.RIGHTS_DIRECTORY_INHERITING = constants.RIGHTS_DIRECTORY_BASE
                                      | constants.RIGHTS_REGULAR_FILE_BASE;

constants.RIGHTS_SOCKET_BASE = constants.WASI_RIGHT_FD_READ
                             | constants.WASI_RIGHT_FD_FDSTAT_SET_FLAGS
                             | constants.WASI_RIGHT_FD_WRITE
                             | constants.WASI_RIGHT_FD_FILESTAT_GET
                             | constants.WASI_RIGHT_POLL_FD_READWRITE
                             | constants.WASI_RIGHT_SOCK_SHUTDOWN;

constants.RIGHTS_SOCKET_INHERITING = constants.RIGHTS_ALL;

constants.RIGHTS_TTY_BASE = constants.WASI_RIGHT_FD_READ
                          | constants.WASI_RIGHT_FD_FDSTAT_SET_FLAGS
                          | constants.WASI_RIGHT_FD_WRITE
                          | constants.WASI_RIGHT_FD_FILESTAT_GET
                          | constants.WASI_RIGHT_POLL_FD_READWRITE;

constants.RIGHTS_TTY_INHERITING = BigInt(0);

constants.RIGHTS_OPEN_READ = constants.WASI_RIGHT_FD_READ
                           | constants.WASI_RIGHT_FD_READDIR;

constants.RIGHTS_OPEN_WRITE = constants.WASI_RIGHT_FD_DATASYNC
                            | constants.WASI_RIGHT_FD_WRITE
                            | constants.WASI_RIGHT_FD_ALLOCATE
                            | constants.WASI_RIGHT_FD_FILESTAT_SET_SIZE;

/*
 * Expose
 */

module.exports = constants;
