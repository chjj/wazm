/*!
 * maps.js - maps for wasi
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

const constants = require('./constants');

/*
 * Signals
 */

const signals = {
  __proto__: null,
  [constants.WASI_SIGHUP]: 'SIGHUP',
  [constants.WASI_SIGINT]: 'SIGINT',
  [constants.WASI_SIGQUIT]: 'SIGQUIT',
  [constants.WASI_SIGILL]: 'SIGILL',
  [constants.WASI_SIGTRAP]: 'SIGTRAP',
  [constants.WASI_SIGABRT]: 'SIGABRT',
  // [constants.WASI_SIGIOT]: 'SIGIOT',
  [constants.WASI_SIGBUS]: 'SIGBUS',
  [constants.WASI_SIGFPE]: 'SIGFPE',
  [constants.WASI_SIGKILL]: 'SIGKILL',
  [constants.WASI_SIGUSR1]: 'SIGUSR1',
  [constants.WASI_SIGSEGV]: 'SIGSEGV',
  [constants.WASI_SIGUSR2]: 'SIGUSR2',
  [constants.WASI_SIGPIPE]: 'SIGPIPE',
  [constants.WASI_SIGALRM]: 'SIGALRM',
  [constants.WASI_SIGTERM]: 'SIGTERM',
  [constants.WASI_SIGCHLD]: 'SIGCHLD',
  [constants.WASI_SIGCONT]: 'SIGCONT',
  [constants.WASI_SIGSTOP]: 'SIGSTOP',
  [constants.WASI_SIGTSTP]: 'SIGTSTP',
  [constants.WASI_SIGTTIN]: 'SIGTTIN',
  [constants.WASI_SIGTTOU]: 'SIGTTOU',
  [constants.WASI_SIGURG]: 'SIGURG',
  [constants.WASI_SIGXCPU]: 'SIGXCPU',
  [constants.WASI_SIGXFSZ]: 'SIGXFSZ',
  [constants.WASI_SIGVTALRM]: 'SIGVTALRM'
  // [constants.WASI_SIGPROF]: 'SIGPROF',
  // [constants.WASI_SIGWINCH]: 'SIGWINCH',
  // [constants.WASI_SIGIO]: 'SIGIO',
  // [constants.WASI_SIGINFO]: 'SIGINFO',
  // [constants.WASI_SIGSYS]: 'SIGSYS'
};

/*
 * Errors
 */

const errors = {
  __proto__: null,
  E2BIG: constants.WASI_E2BIG,
  EACCES: constants.WASI_EACCES,
  EADDRINUSE: constants.WASI_EADDRINUSE,
  EADDRNOTAVAIL: constants.WASI_EADDRNOTAVAIL,
  EAFNOSUPPORT: constants.WASI_EAFNOSUPPORT,
  EALREADY: constants.WASI_EALREADY,
  EAGAIN: constants.WASI_EAGAIN,
  // EBADE: constants.WASI_EBADE,
  EBADF: constants.WASI_EBADF,
  // EBADFD: constants.WASI_EBADFD,
  EBADMSG: constants.WASI_EBADMSG,
  // EBADR: constants.WASI_EBADR,
  // EBADRQC: constants.WASI_EBADRQC,
  // EBADSLT: constants.WASI_EBADSLT,
  EBUSY: constants.WASI_EBUSY,
  ECANCELED: constants.WASI_ECANCELED,
  ECHILD: constants.WASI_ECHILD,
  // ECHRNG: constants.WASI_ECHRNG,
  // ECOMM: constants.WASI_ECOMM,
  ECONNABORTED: constants.WASI_ECONNABORTED,
  ECONNREFUSED: constants.WASI_ECONNREFUSED,
  ECONNRESET: constants.WASI_ECONNRESET,
  EDEADLOCK: constants.WASI_EDEADLK,
  EDESTADDRREQ: constants.WASI_EDESTADDRREQ,
  EDOM: constants.WASI_EDOM,
  EDQUOT: constants.WASI_EDQUOT,
  EEXIST: constants.WASI_EEXIST,
  EFAULT: constants.WASI_EFAULT,
  EFBIG: constants.WASI_EFBIG,
  EHOSTDOWN: constants.WASI_EHOSTUNREACH,
  EHOSTUNREACH: constants.WASI_EHOSTUNREACH,
  // EHWPOISON: constants.WASI_EHWPOISON,
  EIDRM: constants.WASI_EIDRM,
  EILSEQ: constants.WASI_EILSEQ,
  EINPROGRESS: constants.WASI_EINPROGRESS,
  EINTR: constants.WASI_EINTR,
  EINVAL: constants.WASI_EINVAL,
  EIO: constants.WASI_EIO,
  EISCONN: constants.WASI_EISCONN,
  EISDIR: constants.WASI_EISDIR,
  // EISNAM: constants.WASI_EISNAM,
  // EKEYEXPIRED: constants.WASI_EKEYEXPIRED,
  // EKEYREJECTED: constants.WASI_EKEYREJECTED,
  // EKEYREVOKED: constants.WASI_EKEYREVOKED,
  // EL2HLT: constants.WASI_EL2HLT,
  // EL2NSYNC: constants.WASI_EL2NSYNC,
  // EL3HLT: constants.WASI_EL3HLT,
  // EL3RST: constants.WASI_EL3RST,
  // ELIBACC: constants.WASI_ELIBACC,
  // ELIBBAD: constants.WASI_ELIBBAD,
  // ELIBMAX: constants.WASI_ELIBMAX,
  // ELIBSCN: constants.WASI_ELIBSCN,
  // ELIBEXEC: constants.WASI_ELIBEXEC,
  // ELNRANGE: constants.WASI_ELNRANGE,
  ELOOP: constants.WASI_ELOOP,
  // EMEDIUMTYPE: constants.WASI_EMEDIUMTYPE,
  EMFILE: constants.WASI_EMFILE,
  EMLINK: constants.WASI_EMLINK,
  EMSGSIZE: constants.WASI_EMSGSIZE,
  EMULTIHOP: constants.WASI_EMULTIHOP,
  ENAMETOOLONG: constants.WASI_ENAMETOOLONG,
  ENETDOWN: constants.WASI_ENETDOWN,
  ENETRESET: constants.WASI_ENETRESET,
  ENETUNREACH: constants.WASI_ENETUNREACH,
  ENFILE: constants.WASI_ENFILE,
  // ENOANO: constants.WASI_ENOANO,
  ENOBUFS: constants.WASI_ENOBUFS,
  // ENODATA: constants.WASI_ENODATA,
  ENODEV: constants.WASI_ENODEV,
  ENOENT: constants.WASI_ENOENT,
  ENOEXEC: constants.WASI_ENOEXEC,
  // ENOKEY: constants.WASI_ENOKEY,
  ENOLCK: constants.WASI_ENOLCK,
  ENOLINK: constants.WASI_ENOLINK,
  // ENOMEDIUM: constants.WASI_ENOMEDIUM,
  ENOMEM: constants.WASI_ENOMEM,
  ENOMSG: constants.WASI_ENOMSG,
  // ENONET: constants.WASI_ENONET,
  // ENOPKG: constants.WASI_ENOPKG,
  ENOPROTOOPT: constants.WASI_ENOPROTOOPT,
  ENOSPC: constants.WASI_ENOSPC,
  // ENOSR: constants.WASI_ENOSR,
  // ENOSTR: constants.WASI_ENOSTR,
  ENOSYS: constants.WASI_ENOSYS,
  // ENOTBLK: constants.WASI_ENOTBLK,
  ENOTCONN: constants.WASI_ENOTCONN,
  ENOTDIR: constants.WASI_ENOTDIR,
  ENOTEMPTY: constants.WASI_ENOTEMPTY,
  ENOTRECOVERABLE: constants.WASI_ENOTRECOVERABLE,
  ENOTSOCK: constants.WASI_ENOTSOCK,
  ENOTTY: constants.WASI_ENOTTY,
  // ENOTUNIQ: constants.WASI_ENOTUNIQ,
  ENXIO: constants.WASI_ENXIO,
  EOVERFLOW: constants.WASI_EOVERFLOW,
  EOWNERDEAD: constants.WASI_EOWNERDEAD,
  EPERM: constants.WASI_EPERM,
  // EPFNOSUPPORT: constants.WASI_EPFNOSUPPORT,
  EPIPE: constants.WASI_EPIPE,
  EPROTO: constants.WASI_EPROTO,
  EPROTONOSUPPORT: constants.WASI_EPROTONOSUPPORT,
  EPROTOTYPE: constants.WASI_EPROTOTYPE,
  ERANGE: constants.WASI_ERANGE,
  // EREMCHG: constants.WASI_EREMCHG,
  // EREMOTE: constants.WASI_EREMOTE,
  // EREMOTEIO: constants.WASI_EREMOTEIO,
  // ERESTART: constants.WASI_ERESTART,
  // ERFKILL: constants.WASI_ERFKILL,
  EROFS: constants.WASI_EROFS,
  // ESHUTDOWN: constants.WASI_ESHUTDOWN,
  ESPIPE: constants.WASI_ESPIPE,
  // ESOCKTNOSUPPORT: constants.WASI_ESOCKTNOSUPPORT,
  ESRCH: constants.WASI_ESRCH,
  ESTALE: constants.WASI_ESTALE,
  // ESTRPIPE: constants.WASI_ESTRPIPE,
  // ETIME: constants.WASI_ETIME,
  ETIMEDOUT: constants.WASI_ETIMEDOUT,
  // ETOOMANYREFS: constants.WASI_ETOOMANYREFS,
  ETXTBSY: constants.WASI_ETXTBSY,
  // EUCLEAN: constants.WASI_EUCLEAN,
  // EUNATCH: constants.WASI_EUNATCH,
  // EUSERS: constants.WASI_EUSERS,
  EXDEV: constants.WASI_EXDEV
  // EXFULL: constants.WASI_EXFULL
};

/*
 * Expose
 */

exports.signals = signals;
exports.errors = errors;
