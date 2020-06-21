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
 *   https://github.com/nodejs/node/blob/master/deps/uvwasi/include/wasi_types.h
 *   https://github.com/emscripten-core/emscripten/blob/master/system/include/wasi/api.h
 *   https://github.com/CraneStation/wasi-libc/blob/master/libc-bottom-half/headers/public/wasi/api.h
 */

'use strict';

const BigInt = global.BigInt || Number;

/*
 * Constants
 */

const constants = {
  // Advice
  WASI_ADVICE_NORMAL: 0,
  WASI_ADVICE_SEQUENTIAL: 1,
  WASI_ADVICE_RANDOM: 2,
  WASI_ADVICE_WILLNEED: 3,
  WASI_ADVICE_DONTNEED: 4,
  WASI_ADVICE_NOREUSE: 5,

  // Clocks
  WASI_CLOCK_REALTIME: 0,
  WASI_CLOCK_MONOTONIC: 1,
  WASI_CLOCK_PROCESS_CPUTIME_ID: 2,
  WASI_CLOCK_THREAD_CPUTIME_ID: 3,

  // Directory Cookies
  WASI_DIRCOOKIE_START: 0,

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

  // File Descriptor Events
  WASI_EVENT_FD_READWRITE_HANGUP: 1 << 0,

  // Event Types
  WASI_EVENTTYPE_CLOCK: 0,
  WASI_EVENTTYPE_FD_READ: 1,
  WASI_EVENTTYPE_FD_WRITE: 2,

  // File Descriptor Flags
  WASI_FDFLAG_APPEND: 1 << 0,
  WASI_FDFLAG_DSYNC: 1 << 1,
  WASI_FDFLAG_NONBLOCK: 1 << 2,
  WASI_FDFLAG_RSYNC: 1 << 3,
  WASI_FDFLAG_SYNC: 1 << 4,

  // File Types
  WASI_FILETYPE_UNKNOWN: 0,
  WASI_FILETYPE_BLOCK_DEVICE: 1,
  WASI_FILETYPE_CHARACTER_DEVICE: 2,
  WASI_FILETYPE_DIRECTORY: 3,
  WASI_FILETYPE_REGULAR_FILE: 4,
  WASI_FILETYPE_SOCKET_DGRAM: 5,
  WASI_FILETYPE_SOCKET_STREAM: 6,
  WASI_FILETYPE_SYMBOLIC_LINK: 7,

  // File Stats
  WASI_FILESTAT_SET_ATIM: 1 << 0,
  WASI_FILESTAT_SET_ATIM_NOW: 1 << 1,
  WASI_FILESTAT_SET_MTIM: 1 << 2,
  WASI_FILESTAT_SET_MTIM_NOW: 1 << 3,

  // Lookup Flags
  WASI_LOOKUP_SYMLINK_FOLLOW: 1 << 0,

  // Open Flags
  WASI_O_CREAT: 1 << 0,
  WASI_O_DIRECTORY: 1 << 1,
  WASI_O_EXCL: 1 << 2,
  WASI_O_TRUNC: 1 << 3,

  // Preopen Types
  WASI_PREOPENTYPE_DIR: 0,

  // Socket Receive Flags
  WASI_SOCK_RECV_PEEK: 1 << 0,
  WASI_SOCK_RECV_WAITALL: 1 << 1,

  // Rights
  WASI_RIGHT_FD_DATASYNC: BigInt(1 << 0),
  WASI_RIGHT_FD_READ: BigInt(1 << 1),
  WASI_RIGHT_FD_SEEK: BigInt(1 << 2),
  WASI_RIGHT_FD_FDSTAT_SET_FLAGS: BigInt(1 << 3),
  WASI_RIGHT_FD_SYNC: BigInt(1 << 4),
  WASI_RIGHT_FD_TELL: BigInt(1 << 5),
  WASI_RIGHT_FD_WRITE: BigInt(1 << 6),
  WASI_RIGHT_FD_ADVISE: BigInt(1 << 7),
  WASI_RIGHT_FD_ALLOCATE: BigInt(1 << 8),
  WASI_RIGHT_PATH_CREATE_DIRECTORY: BigInt(1 << 9),
  WASI_RIGHT_PATH_CREATE_FILE: BigInt(1 << 10),
  WASI_RIGHT_PATH_LINK_SOURCE: BigInt(1 << 11),
  WASI_RIGHT_PATH_LINK_TARGET: BigInt(1 << 12),
  WASI_RIGHT_PATH_OPEN: BigInt(1 << 13),
  WASI_RIGHT_FD_READDIR: BigInt(1 << 14),
  WASI_RIGHT_PATH_READLINK: BigInt(1 << 15),
  WASI_RIGHT_PATH_RENAME_SOURCE: BigInt(1 << 16),
  WASI_RIGHT_PATH_RENAME_TARGET: BigInt(1 << 17),
  WASI_RIGHT_PATH_FILESTAT_GET: BigInt(1 << 18),
  WASI_RIGHT_PATH_FILESTAT_SET_SIZE: BigInt(1 << 19),
  WASI_RIGHT_PATH_FILESTAT_SET_TIMES: BigInt(1 << 20),
  WASI_RIGHT_FD_FILESTAT_GET: BigInt(1 << 21),
  WASI_RIGHT_FD_FILESTAT_SET_SIZE: BigInt(1 << 22),
  WASI_RIGHT_FD_FILESTAT_SET_TIMES: BigInt(1 << 23),
  WASI_RIGHT_PATH_SYMLINK: BigInt(1 << 24),
  WASI_RIGHT_PATH_REMOVE_DIRECTORY: BigInt(1 << 25),
  WASI_RIGHT_PATH_UNLINK_FILE: BigInt(1 << 26),
  WASI_RIGHT_POLL_FD_READWRITE: BigInt(1 << 27),
  WASI_RIGHT_SOCK_SHUTDOWN: BigInt(1 << 28),

  // Socket Data Flags
  WASI_SOCK_RECV_DATA_TRUNCATED: (1 << 0),

  // ??
  WASI_SHUT_RD: 1 << 0,
  WASI_SHUT_WR: 1 << 1,

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

  // Subscription Clock Flags
  WASI_SUBSCRIPTION_CLOCK_ABSTIME: 1 << 0,

  // Seek Flags
  WASI_WHENCE_SET: 0,
  WASI_WHENCE_CUR: 1,
  WASI_WHENCE_END: 2,

  // File Descriptors
  WASI_STDIN_FILENO: 0,
  WASI_STDOUT_FILENO: 1,
  WASI_STDERR_FILENO: 2,

  // Max Symbolic Links
  WASI_MAX_SYMLINK_FOLLOWS: 32,

  // Precomputed Rights Fields
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
  RIGHTS_OPEN_READ: BigInt(0),
  RIGHTS_OPEN_WRITE: BigInt(0),

  FILESTAT_SET_TIM_ALL: 0
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

constants.FILESTAT_SET_TIM_ALL = constants.WASI_FILESTAT_SET_ATIM_NOW
                               | constants.WASI_FILESTAT_SET_MTIM_NOW
                               | constants.WASI_FILESTAT_SET_ATIM
                               | constants.WASI_FILESTAT_SET_MTIM;

/*
 * Expose
 */

module.exports = constants;
