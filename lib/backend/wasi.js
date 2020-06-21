/*!
 * wasi.js - wasi backend for wazm
 * Copyright (c) 2019, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/wazm
 *
 * Parts of this software are based on devsnek/node-wasi:
 *   Copyright (c) 2019, Gus Caplan (MIT License).
 *   https://github.com/devsnek/node-wasi
 *
 * Resources:
 *   https://github.com/WebAssembly/WASI
 *   https://github.com/WebAssembly/WASI/tree/master/phases/snapshot
 *   https://github.com/devsnek/node-wasi/blob/master/src/index.js
 *   https://github.com/wasmerio/wasmer-js/blob/master/packages/wasi/src/index.ts
 *   https://github.com/emscripten-core/emscripten/blob/master/system/include/wasi/api.h
 *   https://github.com/CraneStation/wasi-libc/blob/master/libc-bottom-half/headers/public/wasi/api.h
 *   https://github.com/nodejs/node/blob/master/deps/uvwasi/src/uvwasi.c
 */

/* eslint camelcase: 'off' */

'use strict';

const constants = require('./constants');
const errors = require('./errors');
const io = require('./io');
const maps = require('./maps');
const BigInt = global.BigInt || Number;

const {
  WASIError,
  WASIExitError,
  WASIKillError,
  AssertionError,
  assert
} = errors;

/*
 * Constants
 */

const MAX_SAFE_BIGINT = BigInt(9007199254740991);

/*
 * WASI
 */

class WASI {
  constructor(options = {}) {
    this.args = options.args || [];
    this.env = options.env || Object.create(null);
    this.returnOnExit = options.returnOnExit || false;
    this.fds = new Map();
    this.memory = { buffer: new ArrayBuffer(0) };
    this._buffer = Buffer.from(this.memory.buffer);
    this._view = new DataView(this.memory.buffer);
    this.wasiImport = this.toAPI();
    this.fd = constants.WASI_STDERR_FILENO + 1;
    this.exitCode = 0;
    this.nodeCompat = false;
    this.init(options);
  }

  get buffer() {
    if (this._buffer.buffer !== this.memory.buffer)
      this._buffer = Buffer.from(this.memory.buffer);

    return this._buffer;
  }

  get view() {
    if (this._view.buffer !== this.memory.buffer)
      this._view = new DataView(this.memory.buffer);

    return this._view;
  }

  init(options) {
    this.addSTDIO(constants.WASI_STDIN_FILENO, 0, '<stdin>');
    this.addSTDIO(constants.WASI_STDOUT_FILENO, 1, '<stdout>');
    this.addSTDIO(constants.WASI_STDERR_FILENO, 2, '<stderr>');

    if (io.fs && options.preopens) {
      for (const alias of Object.keys(options.preopens)) {
        const path = io.fs.realpathSync(options.preopens[alias]);

        assert(io.posix.isAbsolute(alias));

        this.fds.set(this.fd, {
          handle: io.fs.openSync(path),
          type: constants.WASI_FILETYPE_DIRECTORY,
          rights: {
            base: constants.RIGHTS_DIRECTORY_BASE,
            inheriting: constants.RIGHTS_DIRECTORY_INHERITING
          },
          flags: 0,
          pos: undefined,
          alias: io.posix.normalize(alias),
          path
        });

        this.fd += 1;
      }
    }
  }

  addSTDIO(fd, handle, path) {
    this.fds.set(fd, {
      handle,
      type: constants.WASI_FILETYPE_CHARACTER_DEVICE,
      rights: {
        base: constants.RIGHTS_CHARACTER_DEVICE_BASE,
        inheriting: constants.RIGHTS_CHARACTER_DEVICE_INHERITING
      },
      flags: 0,
      pos: undefined,
      alias: null,
      path
    });

    if (io.fs) {
      try {
        this._addSTDIO(fd, handle, path);
      } catch (e) {
        ;
      }
    }
  }

  _addSTDIO(fd, handle, path) {
    const stats = io.fs.fstatSync(handle);
    const [type, base, inheriting] = convertStats(stats, handle);

    this.fds.set(fd, {
      handle,
      type,
      rights: {
        base,
        inheriting
      },
      flags: 0,
      pos: undefined,
      alias: null,
      path
    });
  }

  check(fd, rights, inheriting) {
    if (!io.fs)
      throw new WASIError(constants.WASI_ENOSYS);

    const stats = this.fds.get(fd);

    if (!stats)
      throw new WASIError(constants.WASI_EBADF);

    if (rights != null && !(stats.rights.base & rights))
      throw new WASIError(constants.WASI_ENOTCAPABLE);

    if (inheriting != null && !(stats.rights.inheriting & inheriting))
      throw new WASIError(constants.WASI_ENOTCAPABLE);

    return stats;
  }

  resolve(root, child, flags) {
    if (!io.path || !io.posix)
      throw new WASIError(constants.WASI_ENOSYS);

    if (io.platform === 'win32') {
      child = io.posix.normalize(child);

      if (io.posix.isAbsolute(child))
        child = io.path.parse(root).root + child.substring(1);
    }

    child = io.path.resolve(root, child);

    if (this.nodeCompat) {
      if (!isSandboxed(child, root))
        throw new WASIError(constants.WASI_ENOTCAPABLE);

      let cwd = io.path.dirname(child);
      let real = child;
      let i;

      for (i = 0; i < constants.WASI_MAX_SYMLINK_FOLLOWS; i++) {
        try {
          real = io.fs.readlinkSync(real);
        } catch (e) {
          if (e.code === 'EINVAL' || e.code === 'ENOENT')
            break;

          throw e;
        }

        real = io.path.resolve(cwd, real);
        cwd = io.path.dirname(real);
      }

      if (i === constants.WASI_MAX_SYMLINK_FOLLOWS)
        throw new WASIError(constants.WASI_ELOOP);

      if (!isSandboxed(real, root))
        throw new WASIError(constants.WASI_ENOTCAPABLE);

      return [child, real];
    }

    const real = safeRealpath(child);

    if (!isSandboxed(real, root))
      throw new WASIError(constants.WASI_ENOTCAPABLE);

    return [child, real];
  }

  paths(stats, path, path_len, flags) {
    if (stats.type !== constants.WASI_FILETYPE_DIRECTORY)
      throw new WASIError(constants.WASI_ENOTDIR);

    const child = this.buffer.toString('utf8', path, path + path_len);

    return this.resolve(stats.path, child, flags);
  }

  path(stats, path, path_len, flags) {
    const [path_, real] = this.paths(stats, path, path_len, flags);

    if (flags & constants.WASI_LOOKUP_SYMLINK_FOLLOW)
      return real;

    return path_;
  }

  setMemory(memory) {
    this.memory = memory;
  }

  start(instance) {
    if (!instance.exports._start)
      throw new Error('Instance does not contain a _start export.');

    if (instance.exports._initialize)
      throw new Error('Instance contains an _initialize export.');

    try {
      instance.exports._start();
    } catch (e) {
      let err = e;

      if (isUnreachableError(err))
        err = new WASIExitError(this.exitCode || 1);

      if (this.returnOnExit) {
        if (err instanceof WASIExitError)
          return err.code;
      }

      throw err;
    }

    return 0;
  }

  getiovs(iovs, iovs_len) {
    const out = new Array(iovs_len);

    // typedef struct __wasi_iovec_t {
    //   uint8_t *buf;
    //   __wasi_size_t buf_len;
    // } __wasi_iovec_t;
    for (let i = 0; i < iovs_len; i++) {
      const buf = this.view.getUint32(iovs + 0, true);
      const buf_len = this.view.getUint32(iovs + 4, true);

      out[i] = this.buffer.slice(buf, buf + buf_len);

      iovs += 8;
    }

    return out;
  }

  args_get(argv, argv_buf) {
    // __wasi_errno_t __wasi_args_get(
    //   uint8_t **argv,
    //   uint8_t *argv_buf
    // )
    for (const arg of this.args) {
      this.view.setUint32(argv, argv_buf, true);

      argv += 4;

      argv_buf += this.buffer.write(arg, argv_buf, 'binary');

      this.buffer[argv_buf++] = 0;
    }

    return constants.WASI_ESUCCESS;
  }

  args_sizes_get(argc, argv_buf_size) {
    // __wasi_errno_t __wasi_args_sizes_get(
    //   __wasi_size_t *argc,
    //   __wasi_size_t *argv_buf_size
    // )
    if (argc === 0 || argv_buf_size === 0)
      return constants.WASI_EINVAL;

    let size = 0;

    for (const arg of this.args)
      size += Buffer.byteLength(arg, 'binary') + 1;

    this.view.setUint32(argc, this.args.length, true);
    this.view.setUint32(argv_buf_size, size, true);

    return constants.WASI_ESUCCESS;
  }

  environ_get(environ, environ_buf) {
    // __wasi_errno_t __wasi_environ_get(
    //   uint8_t **environ,
    //   uint8_t *environ_buf
    // )
    for (const key of Object.keys(this.env)) {
      const val = this.env[key];

      this.view.setUint32(environ, environ_buf, true);

      environ += 4;

      environ_buf += this.buffer.write(key, environ_buf, 'binary');

      this.buffer[environ_buf++] = 61;

      environ_buf += this.buffer.write(val, environ_buf, 'binary');

      this.buffer[environ_buf++] = 0;
    }

    return constants.WASI_ESUCCESS;
  }

  environ_sizes_get(environc, environ_buf_size) {
    // __wasi_errno_t __wasi_environ_sizes_get(
    //   __wasi_size_t *environc,
    //   __wasi_size_t *environ_buf_size
    // )
    if (environc === 0 || environ_buf_size === 0)
      return constants.WASI_EINVAL;

    const keys = Object.keys(this.env);

    let size = 0;

    for (const key of keys) {
      const val = this.env[key];

      size += Buffer.byteLength(key, 'binary');
      size += Buffer.byteLength(val, 'binary');
      size += 1;
    }

    this.view.setUint32(environc, keys.length, true);
    this.view.setUint32(environ_buf_size, size, true);

    return constants.WASI_ESUCCESS;
  }

  clock_res_get(id, resolution) {
    // __wasi_errno_t __wasi_clock_res_get(
    //   __wasi_clockid_t id,
    //   __wasi_timestamp_t *resolution
    // )
    let res;

    if (resolution === 0)
      return constants.WASI_EINVAL;

    switch (id) {
      case constants.WASI_CLOCK_REALTIME:
        res = BigInt(1000);
        break;
      case constants.WASI_CLOCK_MONOTONIC:
      case constants.WASI_CLOCK_PROCESS_CPUTIME_ID:
      case constants.WASI_CLOCK_THREAD_CPUTIME_ID:
        res = BigInt(1);
        break;
      default:
        return constants.WASI_EINVAL;
    }

    this.view.setBigUint64(resolution, res);

    return constants.WASI_ESUCCESS;
  }

  clock_time_get(id, precision, time) {
    // __wasi_errno_t __wasi_clock_time_get(
    //   __wasi_clockid_t id,
    //   __wasi_timestamp_t precision,
    //   __wasi_timestamp_t *time
    // )
    if (time === 0)
      return constants.WASI_EINVAL;

    const now = io.now(id);

    this.view.setBigUint64(time, now, true);

    return constants.WASI_ESUCCESS;
  }

  fd_advise(fd, offset, len, advice) {
    // __wasi_errno_t __wasi_fd_advise(
    //   __wasi_fd_t fd,
    //   __wasi_filesize_t offset,
    //   __wasi_filesize_t len,
    //   __wasi_advice_t advice
    // )
    this.check(fd, constants.WASI_RIGHT_FD_ADVISE);

    switch (advice) {
      case constants.WASI_ADVICE_NORMAL:
      case constants.WASI_ADVICE_SEQUENTIAL:
      case constants.WASI_ADVICE_RANDOM:
      case constants.WASI_ADVICE_WILLNEED:
      case constants.WASI_ADVICE_DONTNEED:
      case constants.WASI_ADVICE_NOREUSE:
        break;
      default:
        return constants.WASI_EINVAL;
    }

    return constants.WASI_ESUCCESS;
  }

  fd_allocate(fd, offset, len) {
    // __wasi_errno_t __wasi_fd_allocate(
    //   __wasi_fd_t fd,
    //   __wasi_filesize_t offset,
    //   __wasi_filesize_t len
    // )
    const stats = this.check(fd, constants.WASI_RIGHT_FD_ALLOCATE);
    const {size} = io.fs.fstatSync(stats.handle);
    const nsize = toNumber(offset + len);

    if (size < nsize)
      io.fs.ftruncateSync(stats.handle, nsize);

    return constants.WASI_ESUCCESS;
  }

  fd_close(fd) {
    // __wasi_errno_t __wasi_fd_close(
    //   __wasi_fd_t fd
    // )
    const stats = this.check(fd);

    io.fs.closeSync(stats.handle);

    this.fds.delete(fd);

    return constants.WASI_ESUCCESS;
  }

  fd_datasync(fd) {
    // __wasi_errno_t __wasi_fd_datasync(
    //   __wasi_fd_t fd
    // )
    const stats = this.check(fd, constants.WASI_RIGHT_FD_DATASYNC);

    io.fs.fdatasyncSync(stats.handle);

    return constants.WASI_ESUCCESS;
  }

  fd_fdstat_get(fd, stat) {
    // __wasi_errno_t __wasi_fd_fdstat_get(
    //   __wasi_fd_t fd,
    //   __wasi_fdstat_t *stat
    // )
    if (stat === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd);

    // typedef struct __wasi_fdstat_t {
    //   __wasi_filetype_t fs_filetype;
    //   __wasi_fdflags_t fs_flags;
    //   __wasi_rights_t fs_rights_base;
    //   __wasi_rights_t fs_rights_inheriting;
    // } __wasi_fdstat_t;
    this.view.setUint8(stat + 0, stats.type);
    this.view.setUint32(stat + 2, stats.flags, true);
    this.view.setBigUint64(stat + 8, stats.rights.base, true);
    this.view.setBigUint64(stat + 16, stats.rights.inheriting, true);

    return constants.WASI_ESUCCESS;
  }

  fd_fdstat_set_flags(fd, flags) {
    // __wasi_errno_t __wasi_fd_fdstat_set_flags(
    //   __wasi_fd_t fd,
    //   __wasi_fdflags_t flags
    // )
    this.check(fd, constants.WASI_RIGHT_FD_FDSTAT_SET_FLAGS);
    return constants.WASI_ENOSYS;
  }

  fd_fdstat_set_rights(fd, fs_rights_base, fs_rights_inheriting) {
    // __wasi_errno_t __wasi_fd_fdstat_set_rights(
    //   __wasi_fd_t fd,
    //   __wasi_rights_t fs_rights_base,
    //   __wasi_rights_t fs_rights_inheriting
    // )
    const stats = this.check(fd);
    const base = fs_rights_base | stats.rights.base;
    const inheriting = fs_rights_inheriting | stats.rights.inheriting;

    if (base > stats.rights.base)
      return constants.WASI_ENOTCAPABLE;

    if (inheriting > stats.rights.inheriting)
      return constants.WASI_ENOTCAPABLE;

    stats.rights.base = fs_rights_base;
    stats.rights.inheriting = fs_rights_inheriting;

    return constants.WASI_ESUCCESS;
  }

  fd_filestat_get(fd, buf) {
    // __wasi_errno_t __wasi_fd_filestat_get(
    //   __wasi_fd_t fd,
    //   __wasi_filestat_t *buf
    // )
    if (buf === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_FD_FILESTAT_GET);
    const rstats = io.fs.fstatSync(stats.handle);

    // typedef struct __wasi_filestat_t {
    //   __wasi_device_t dev;
    //   __wasi_inode_t ino;
    //   __wasi_filetype_t filetype;
    //   __wasi_linkcount_t nlink;
    //   __wasi_filesize_t size;
    //   __wasi_timestamp_t atim;
    //   __wasi_timestamp_t mtim;
    //   __wasi_timestamp_t ctim;
    // } __wasi_filestat_t;
    this.view.setBigUint64(buf + 0, BigInt(rstats.dev), true);
    this.view.setBigUint64(buf + 8, BigInt(rstats.ino), true);
    this.view.setUint8(buf + 16, stats.type);
    this.view.setUint32(buf + 24, rstats.nlink, true);
    this.view.setBigUint64(buf + 32, BigInt(rstats.size), true);
    this.view.setBigUint64(buf + 40, nanosec(rstats.atimeMs), true);
    this.view.setBigUint64(buf + 48, nanosec(rstats.mtimeMs), true);
    this.view.setBigUint64(buf + 56, nanosec(rstats.ctimeMs), true);

    return constants.WASI_ESUCCESS;
  }

  fd_filestat_set_size(fd, size) {
    // __wasi_errno_t __wasi_fd_filestat_set_size(
    //   __wasi_fd_t fd,
    //   __wasi_filesize_t size
    // )
    const stats = this.check(fd, constants.WASI_RIGHT_FD_FILESTAT_SET_SIZE);

    io.fs.ftruncateSync(stats.handle, toNumber(size));

    return constants.WASI_ESUCCESS;
  }

  fd_filestat_set_times(fd, atim, mtim, fst_flags) {
    // __wasi_errno_t __wasi_fd_filestat_set_times(
    //   __wasi_fd_t fd,
    //   __wasi_timestamp_t atim,
    //   __wasi_timestamp_t mtim,
    //   __wasi_fstflags_t fst_flags
    // )
    if (fst_flags & ~constants.FILESTAT_SET_TIM_ALL)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_FD_FILESTAT_SET_TIMES);
    const st = io.fs.fstatSync(stats.handle);
    const now = Date.now();

    let atime, mtime;

    if (fst_flags & constants.WASI_FILESTAT_SET_ATIM_NOW)
      atime = now;
    else if (fst_flags & constants.WASI_FILESTAT_SET_ATIM)
      atime = millisec(atim);
    else
      atime = Math.floor(st.atimeMs);

    if (fst_flags & constants.WASI_FILESTAT_SET_MTIM_NOW)
      mtime = now;
    else if (fst_flags & constants.WASI_FILESTAT_SET_MTIM)
      mtime = millisec(mtim);
    else
      mtime = Math.floor(st.mtimeMs);

    io.fs.futimesSync(stats.handle, new Date(atime), new Date(mtime));

    return constants.WASI_ESUCCESS;
  }

  fd_pread(fd, iovs, iovs_len, offset, nread) {
    // __wasi_errno_t __wasi_fd_pread(
    //   __wasi_fd_t fd,
    //   const __wasi_iovec_t *iovs,
    //   size_t iovs_len,
    //   __wasi_filesize_t offset,
    //   __wasi_size_t *nread
    // )
    if (nread === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_FD_READ
                               | constants.WASI_RIGHT_FD_SEEK);

    let cnt = 0;
    let pos = toNumber(offset);

    for (const iov of this.getiovs(iovs, iovs_len)) {
      let len = iov.length;
      let off = 0;

      while (len > 0) {
        const bytes = io.fs.readSync(stats.handle, iov, off, len, pos);

        off += bytes;
        len -= bytes;
        pos += bytes;
        cnt += bytes;
      }
    }

    this.view.setUint32(nread, cnt, true);

    return constants.WASI_ESUCCESS;
  }

  fd_prestat_get(fd, buf) {
    // __wasi_errno_t __wasi_fd_prestat_get(
    //   __wasi_fd_t fd,
    //   __wasi_prestat_t *buf
    // )
    if (buf === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd);

    if (!stats.alias)
      return constants.WASI_EINVAL;

    const len = Buffer.byteLength(stats.alias, 'utf8');

    // typedef struct __wasi_prestat_t {
    //   __wasi_preopentype_t pr_type;
    //   union __wasi_prestat_u_t {
    //     struct __wasi_prestat_dir_t {
    //       __wasi_size_t pr_name_len;
    //     } dir;
    //   } u;
    // } __wasi_prestat_t;
    this.view.setUint8(buf + 0, constants.WASI_PREOPENTYPE_DIR);
    this.view.setUint32(buf + 4, len, true);

    return constants.WASI_ESUCCESS;
  }

  fd_prestat_dir_name(fd, path, path_len) {
    // __wasi_errno_t __wasi_fd_prestat_dir_name(
    //   __wasi_fd_t fd,
    //   uint8_t *path,
    //   __wasi_size_t path_len
    // )
    const stats = this.check(fd);

    if (!stats.alias)
      return constants.WASI_EINVAL;

    const len = Buffer.byteLength(stats.alias, 'utf8');

    if (len > path_len)
      return constants.WASI_ENOBUFS;

    this.buffer.write(`${stats.alias}\0`, path, path_len, 'utf8');

    return constants.WASI_ESUCCESS;
  }

  fd_pwrite(fd, iovs, iovs_len, offset, nwritten) {
    // __wasi_errno_t __wasi_fd_pwrite(
    //   __wasi_fd_t fd,
    //   const __wasi_ciovec_t *iovs,
    //   size_t iovs_len,
    //   __wasi_filesize_t offset,
    //   __wasi_size_t *nwritten
    // )
    if (nwritten === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_FD_WRITE
                               | constants.WASI_RIGHT_FD_SEEK);

    let cnt = 0;
    let pos = toNumber(offset);

    for (const iov of this.getiovs(iovs, iovs_len)) {
      let len = iov.length;
      let off = 0;

      while (len > 0) {
        const bytes = io.fs.writeSync(stats.handle, iov, off, len, pos);

        off += bytes;
        len -= bytes;
        pos += bytes;
        cnt += bytes;
      }
    }

    this.view.setUint32(nwritten, cnt, true);

    return constants.WASI_ESUCCESS;
  }

  fd_read(fd, iovs, iovs_len, nread) {
    // __wasi_errno_t __wasi_fd_read(
    //   __wasi_fd_t fd,
    //   const __wasi_iovec_t *iovs,
    //   size_t iovs_len,
    //   __wasi_size_t *nread
    // )
    if (nread === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_FD_READ);

    let cnt = 0;

outer:
    for (const iov of this.getiovs(iovs, iovs_len)) {
      let len = iov.length;
      let off = 0;

      while (len > 0) {
        const bytes = io.fs.readSync(stats.handle, iov, off, len, stats.pos);

        if (stats.pos != null)
          stats.pos += bytes;

        off += bytes;
        len -= bytes;
        cnt += bytes;

        if (stats.handle === 0)
          break outer;

        if (bytes === 0)
          break outer;
      }
    }

    this.view.setUint32(nread, cnt, true);

    return constants.WASI_ESUCCESS;
  }

  fd_readdir(fd, buf, buf_len, cookie, bufused) {
    // __wasi_errno_t __wasi_fd_readdir(
    //   __wasi_fd_t fd,
    //   uint8_t *buf,
    //   __wasi_size_t buf_len,
    //   __wasi_dircookie_t cookie,
    //   __wasi_size_t *bufused
    // )
    if (bufused === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_FD_READDIR);
    const list = io.fs.readdirSync(stats.path);
    const dirent = Buffer.alloc(24);
    const view = new DataView(dirent.buffer);
    const start = buf;

    for (let i = toNumber(cookie); i < list.length; i++) {
      const name = list[i];
      const len = Buffer.byteLength(name, 'utf8');
      const path_ = io.path.resolve(stats.path, name);
      const st = io.fs.lstatSync(path_);

      let bytes = 0;

      // typedef struct __wasi_dirent_t {
      //   __wasi_dircookie_t d_next;
      //   __wasi_inode_t d_ino;
      //   __wasi_dirnamlen_t d_namlen;
      //   __wasi_filetype_t d_type;
      // } __wasi_dirent_t;
      view.setBigUint64(0, BigInt(i + 1), true);
      view.setBigUint64(8, BigInt(st.ino), true);
      view.setUint32(16, len, true);
      view.setUint8(20, getFileType(st));

      bytes = dirent.copy(this.buffer, buf, 0, Math.min(24, buf_len));
      buf += bytes;
      buf_len -= bytes;

      bytes = this.buffer.write(name, buf, Math.min(len, buf_len), 'utf8');
      buf += bytes;
      buf_len -= bytes;

      if (buf_len === 0)
        break;
    }

    this.view.setUint32(bufused, buf - start, true);

    return constants.WASI_ESUCCESS;
  }

  fd_renumber(fd, to) {
    // __wasi_errno_t __wasi_fd_renumber(
    //   __wasi_fd_t fd,
    //   __wasi_fd_t to
    // )
    if (fd === to)
      return constants.WASI_ESUCCESS;

    const fstats = this.check(fd);
    const tstats = this.check(to);

    io.fs.closeSync(tstats.handle);

    this.fds.set(to, fstats);
    this.fds.delete(fd);

    return constants.WASI_ESUCCESS;
  }

  fd_seek(fd, offset, whence, newoffset) {
    // __wasi_errno_t __wasi_fd_seek(
    //   __wasi_fd_t fd,
    //   __wasi_filedelta_t offset,
    //   __wasi_whence_t whence,
    //   __wasi_filesize_t *newoffset
    // )
    if (newoffset === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_FD_SEEK);

    if (!isSeekable(stats.type))
      return constants.WASI_ESPIPE;

    let pos = BigInt(stats.pos || 0);

    switch (whence) {
      case constants.WASI_WHENCE_SET: {
        pos = offset;
        break;
      }

      case constants.WASI_WHENCE_CUR: {
        pos += offset;
        break;
      }

      case constants.WASI_WHENCE_END: {
        const st = io.fs.fstatSync(stats.handle);
        pos = BigInt(st.size) + offset;
        break;
      }

      default: {
        return constants.WASI_EINVAL;
      }
    }

    stats.pos = toNumber(pos);

    this.view.setBigUint64(newoffset, pos, true);

    return constants.WASI_ESUCCESS;
  }

  fd_sync(fd) {
    // __wasi_errno_t __wasi_fd_sync(
    //   __wasi_fd_t fd
    // )
    const stats = this.check(fd, constants.WASI_RIGHT_FD_SYNC);

    io.fs.fsyncSync(stats.handle);

    return constants.WASI_ESUCCESS;
  }

  fd_tell(fd, offset) {
    // __wasi_errno_t __wasi_fd_tell(
    //   __wasi_fd_t fd,
    //   __wasi_filesize_t *offset
    // )
    if (offset === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_FD_TELL);

    if (!isSeekable(stats.type))
      return constants.WASI_ESPIPE;

    if (stats.pos == null)
      stats.pos = 0;

    this.view.setBigUint64(offset, BigInt(stats.pos), true);

    return constants.WASI_ESUCCESS;
  }

  fd_write(fd, iovs, iovs_len, nwritten) {
    // __wasi_errno_t __wasi_fd_write(
    //   __wasi_fd_t fd,
    //   const __wasi_ciovec_t *iovs,
    //   size_t iovs_len,
    //   __wasi_size_t *nwritten
    // )
    if (nwritten === 0)
      return constants.WASI_EINVAL;

    if (!io.fs) {
      if (fd === constants.WASI_STDOUT_FILENO
          || fd === constants.WASI_STDERR_FILENO) {
        let cnt = 0;

        for (const iov of this.getiovs(iovs, iovs_len)) {
          if (fd === constants.WASI_STDOUT_FILENO)
            console.log(iov.toString('utf8'));
          else
            console.error(iov.toString('utf8'));

          cnt += iov.length;
        }

        this.view.setUint32(nwritten, cnt, true);

        return constants.WASI_ESUCCESS;
      }

      return constants.WASI_ENOSYS;
    }

    const stats = this.check(fd, constants.WASI_RIGHT_FD_WRITE);

    let cnt = 0;

    for (const iov of this.getiovs(iovs, iovs_len)) {
      let len = iov.length;
      let off = 0;

      while (len > 0) {
        const bytes = io.fs.writeSync(stats.handle, iov, off, len, stats.pos);

        if (stats.pos != null)
          stats.pos += bytes;

        off += bytes;
        len -= bytes;
        cnt += bytes;
      }
    }

    this.view.setUint32(nwritten, cnt, true);

    return constants.WASI_ESUCCESS;
  }

  path_create_directory(fd, path, path_len) {
    // __wasi_errno_t __wasi_path_create_directory(
    //   __wasi_fd_t fd,
    //   const char *path,
    //   size_t path_len
    // )
    const stats = this.check(fd, constants.WASI_RIGHT_PATH_CREATE_DIRECTORY);
    const path_ = this.path(stats, path, path_len, 0);

    io.fs.mkdirSync(path_);

    return constants.WASI_ESUCCESS;
  }

  path_filestat_get(fd, flags, path, path_len, buf) {
    // __wasi_errno_t __wasi_path_filestat_get(
    //   __wasi_fd_t fd,
    //   __wasi_lookupflags_t flags,
    //   const char *path,
    //   size_t path_len,
    //   __wasi_filestat_t *buf
    // )
    if (buf === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_PATH_FILESTAT_GET);
    const path_ = this.path(stats, path, path_len, flags);
    const st = io.fs.lstatSync(path_);

    // typedef struct __wasi_filestat_t {
    //   __wasi_device_t dev;
    //   __wasi_inode_t ino;
    //   __wasi_filetype_t filetype;
    //   __wasi_linkcount_t nlink;
    //   __wasi_filesize_t size;
    //   __wasi_timestamp_t atim;
    //   __wasi_timestamp_t mtim;
    //   __wasi_timestamp_t ctim;
    // } __wasi_filestat_t;
    this.view.setBigUint64(buf + 0, BigInt(st.dev), true);
    this.view.setBigUint64(buf + 8, BigInt(st.ino), true);
    this.view.setUint8(buf + 16, getFileType(st));
    this.view.setUint32(buf + 24, st.nlink, true);
    this.view.setBigUint64(buf + 32, BigInt(st.size), true);
    this.view.setBigUint64(buf + 40, nanosec(st.atimeMs), true);
    this.view.setBigUint64(buf + 48, nanosec(st.mtimeMs), true);
    this.view.setBigUint64(buf + 56, nanosec(st.ctimeMs), true);

    return constants.WASI_ESUCCESS;
  }

  path_filestat_set_times(fd, flags, path, path_len, atim, mtim, fst_flags) {
    // __wasi_errno_t __wasi_path_filestat_set_times(
    //   __wasi_fd_t fd,
    //   __wasi_lookupflags_t flags,
    //   const char *path,
    //   size_t path_len,
    //   __wasi_timestamp_t atim,
    //   __wasi_timestamp_t mtim,
    //   __wasi_fstflags_t fst_flags
    // )
    if (fst_flags & ~constants.FILESTAT_SET_TIM_ALL)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_PATH_FILESTAT_SET_TIMES);
    const path_ = this.path(stats, path, path_len, flags);
    const st = io.fs.lstatSync(path_);

    if (st.isSymbolicLink())
      throw new WASIError(constants.WASI_ENOTCAPABLE);

    const now = Date.now();

    let atime, mtime;

    if (fst_flags & constants.WASI_FILESTAT_SET_ATIM_NOW)
      atime = now;
    else if (fst_flags & constants.WASI_FILESTAT_SET_ATIM)
      atime = millisec(atim);
    else
      atime = Math.floor(st.atimeMs);

    if (fst_flags & constants.WASI_FILESTAT_SET_MTIM_NOW)
      mtime = now;
    else if (fst_flags & constants.WASI_FILESTAT_SET_MTIM)
      mtime = millisec(mtim);
    else
      mtime = Math.floor(st.mtimeMs);

    io.fs.utimesSync(path_, new Date(atime), new Date(mtime));

    return constants.WASI_ESUCCESS;
  }

  path_link(old_fd, old_flags, old_path, old_path_len,
            new_fd, new_path, new_path_len) {
    // __wasi_errno_t __wasi_path_link(
    //   __wasi_fd_t old_fd,
    //   __wasi_lookupflags_t old_flags,
    //   const char *old_path,
    //   size_t old_path_len,
    //   __wasi_fd_t new_fd,
    //   const char *new_path,
    //   size_t new_path_len
    // )
    const ostats = this.check(old_fd, constants.WASI_RIGHT_PATH_LINK_SOURCE);
    const nstats = this.check(new_fd, constants.WASI_RIGHT_PATH_LINK_TARGET);
    const opath = this.path(ostats, old_path, old_path_len, old_flags);
    const npath = this.path(nstats, new_path, new_path_len, 0);

    io.fs.linkSync(opath, npath);

    return constants.WASI_ESUCCESS;
  }

  path_open(fd, dirflags, path, path_len, oflags,
            fs_rights_base, fs_rights_inheriting,
            fdflags, opened_fd) {
    // __wasi_errno_t __wasi_path_open(
    //   __wasi_fd_t fd,
    //   __wasi_lookupflags_t dirflags,
    //   const char *path,
    //   size_t path_len,
    //   __wasi_oflags_t oflags,
    //   __wasi_rights_t fs_rights_base,
    //   __wasi_rights_t fs_rights_inherting,
    //   __wasi_fdflags_t fdflags,
    //   __wasi_fd_t *opened_fd
    // )
    if (opened_fd === 0)
      return constants.WASI_EINVAL;

    const read = fs_rights_base & constants.RIGHTS_OPEN_READ;
    const write = fs_rights_base & constants.RIGHTS_OPEN_WRITE;

    let noflags = 0;

    if (write && read)
      noflags |= io.fs.constants.O_RDWR;
    else if (write)
      noflags |= io.fs.constants.O_WRONLY;
    else
      noflags |= io.fs.constants.O_RDONLY;

    let base = constants.WASI_RIGHT_PATH_OPEN;
    let inheriting = fs_rights_base | fs_rights_inheriting;

    if (oflags & constants.WASI_O_CREAT) {
      noflags |= io.fs.constants.O_CREAT;
      base |= constants.WASI_RIGHT_PATH_CREATE_FILE;
    }

    if (oflags & constants.WASI_O_DIRECTORY)
      noflags |= io.fs.constants.O_DIRECTORY;

    if (oflags & constants.WASI_O_EXCL)
      noflags |= io.fs.constants.O_EXCL;

    if (oflags & constants.WASI_O_TRUNC) {
      noflags |= io.fs.constants.O_TRUNC;
      base |= constants.WASI_RIGHT_PATH_FILESTAT_SET_SIZE;
    }

    if (fdflags & constants.WASI_FDFLAG_APPEND)
      noflags |= io.fs.constants.O_APPEND;

    if (fdflags & constants.WASI_FDFLAG_DSYNC) {
      if (io.fs.constants.O_DSYNC)
        noflags |= io.fs.constants.O_DSYNC;
      else
        noflags |= io.fs.constants.O_SYNC;

      inheriting |= constants.WASI_RIGHT_FD_DATASYNC;
    }

    if (fdflags & constants.WASI_FDFLAG_NONBLOCK)
      noflags |= io.fs.constants.O_NONBLOCK;

    if (fdflags & constants.WASI_FDFLAG_RSYNC) {
      if (io.fs.constants.O_RSYNC)
        noflags |= io.fs.constants.O_RSYNC;
      else
        noflags |= io.fs.constants.O_SYNC;

      inheriting |= constants.WASI_RIGHT_FD_SYNC;
    }

    if (fdflags & constants.WASI_FDFLAG_SYNC) {
      noflags |= io.fs.constants.O_SYNC;
      inheriting |= constants.WASI_RIGHT_FD_SYNC;
    }

    const atrunc = io.fs.constants.O_APPEND
                 | io.fs.constants.O_TRUNC;

    if (write && !(noflags & atrunc))
      inheriting |= constants.WASI_RIGHT_FD_SEEK;

    const stats = this.check(fd, base, inheriting);
    const [, real] = this.paths(stats, path, path_len, dirflags);
    const handle = io.fs.openSync(real, noflags, 0o666);

    let st;
    try {
      st = io.fs.fstatSync(handle);
    } catch (e) {
      io.fs.closeSync(handle);
      throw e;
    }

    let [type, maxbase, maxinheriting] = convertStats(st, handle);

    // Disable read/write bits depending on access mode.
    const rwo = noflags & (io.fs.constants.O_RDONLY
                         | io.fs.constants.O_WRONLY
                         | io.fs.constants.O_RDWR);

    if (rwo === io.fs.constants.O_RDONLY)
      maxbase &= ~constants.WASI_RIGHT_FD_WRITE;
    else if (rwo === io.fs.constants.O_WRONLY)
      maxbase &= ~constants.WASI_RIGHT_FD_READ;

    if ((oflags & constants.WASI_O_DIRECTORY)
        && type !== constants.WASI_FILETYPE_DIRECTORY) {
      io.fs.closeSync(handle);
      return constants.WASI_ENOTDIR;
    }

    this.fds.set(this.fd, {
      handle,
      type,
      rights: {
        base: fs_rights_base & maxbase,
        inheriting: fs_rights_inheriting & maxinheriting
      },
      flags: fdflags,
      pos: undefined,
      alias: null,
      path: real
    });

    this.view.setUint32(opened_fd, this.fd, true);
    this.fd += 1;

    return constants.WASI_ESUCCESS;
  }

  path_readlink(fd, path, path_len, buf, buf_len, bufused) {
    // __wasi_errno_t __wasi_path_readlink(
    //   __wasi_fd_t fd,
    //   const char *path,
    //   size_t path_len,
    //   uint8_t *buf,
    //   __wasi_size_t buf_len,
    //   __wasi_size_t *bufused
    // )
    if (bufused === 0)
      return constants.WASI_EINVAL;

    const stats = this.check(fd, constants.WASI_RIGHT_PATH_READLINK);
    const path_ = this.path(stats, path, path_len, 0);
    const hard = io.fs.readlinkSync(path_);
    const len = this.buffer.write(hard, buf, buf_len, 'utf8');

    if (len < buf_len)
      this.buffer[buf + len] = 0;

    this.view.setUint32(bufused, len, true);

    return constants.WASI_ESUCCESS;
  }

  path_remove_directory(fd, path, path_len) {
    // __wasi_errno_t __wasi_path_remove_directory(
    //   __wasi_fd_t fd,
    //   const char *path,
    //   size_t path_len
    // )
    const stats = this.check(fd, constants.WASI_RIGHT_PATH_REMOVE_DIRECTORY);
    const path_ = this.path(stats, path, path_len, 0);

    io.fs.rmdirSync(path_);

    return constants.WASI_ESUCCESS;
  }

  path_rename(fd, old_path, old_path_len, new_fd, new_path, new_path_len) {
    // __wasi_errno_t __wasi_path_rename(
    //   __wasi_fd_t fd,
    //   const char *old_path,
    //   size_t old_path_len,
    //   __wasi_fd_t new_fd,
    //   const char *new_path,
    //   size_t new_path_len
    // )
    const ostats = this.check(fd, constants.WASI_RIGHT_PATH_RENAME_SOURCE);
    const nstats = this.check(new_fd, constants.WASI_RIGHT_PATH_RENAME_TARGET);
    const opath = this.path(ostats, old_path, old_path_len, 0);
    const npath = this.path(nstats, new_path, new_path_len, 0);

    io.fs.renameSync(opath, npath);

    return constants.WASI_ESUCCESS;
  }

  path_symlink(old_path, old_path_len, fd, new_path, new_path_len) {
    // __wasi_errno_t __wasi_path_symlink(
    //   const char *old_path,
    //   size_t old_path_len,
    //   __wasi_fd_t fd,
    //   const char *new_path,
    //   size_t new_path_len
    // )
    const stats = this.check(fd, constants.WASI_RIGHT_PATH_SYMLINK);
    const npath = this.path(stats, new_path, new_path_len, 0);
    const opath = this.buffer.toString('utf8', old_path,
                                       old_path + old_path_len);

    io.fs.symlinkSync(opath, npath);

    return constants.WASI_ESUCCESS;
  }

  path_unlink_file(fd, path, path_len) {
    // __wasi_errno_t __wasi_path_unlink_file(
    //   __wasi_fd_t fd,
    //   const char *path,
    //   size_t path_len
    // )
    const stats = this.check(fd, constants.WASI_RIGHT_PATH_UNLINK_FILE);
    const path_ = this.path(stats, path, path_len, 0);

    io.fs.unlinkSync(path_);

    return constants.WASI_ESUCCESS;
  }

  poll_oneoff(inp, out, nsubscriptions, nevents) {
    // __wasi_errno_t __wasi_poll_oneoff(
    //   const __wasi_subscription_t *in,
    //   __wasi_event_t *out,
    //   __wasi_size_t nsubscriptions,
    //   __wasi_size_t *nevents
    // )
    //
    // typedef struct __wasi_subscription_t {
    //   __wasi_userdata_t userdata;
    //   __wasi_eventtype_t type;
    //   union __wasi_subscription_u_t {
    //     struct __wasi_subscription_clock_t {
    //       __wasi_clockid_t id;
    //       __wasi_timestamp_t timeout;
    //       __wasi_timestamp_t precision;
    //       __wasi_subclockflags_t flags;
    //     } clock;
    //     struct __wasi_subscription_fd_readwrite_t {
    //       __wasi_fd_t file_descriptor;
    //     } fd_readwrite;
    //   } u;
    // } __wasi_subscription_t;
    //
    // typedef struct __wasi_event_t {
    //   __wasi_userdata_t userdata;
    //   __wasi_errno_t error;
    //   __wasi_eventtype_t type;
    //   union __wasi_event_u_t {
    //     struct __wasi_event_fd_readwrite_t {
    //       __wasi_filesize_t nbytes;
    //       __wasi_eventrwflags_t flags;
    //     } fd_readwrite;
    //   } u;
    // } __wasi_event_t;
    let timer = null;
    let cnt = 0;

    if (nevents === 0)
      return constants.WASI_EINVAL;

    for (let i = 0; i < nsubscriptions; i++) {
      const userdata = this.view.getBigUint64(inp + 0, true);
      const type = this.view.getUint8(inp + 8);

      inp += 16;

      switch (type) {
        case constants.WASI_EVENTTYPE_CLOCK: {
          const id = this.view.getUint32(inp + 0, true);
          const timeout = this.view.getBigUint64(inp + 8, true);
          // eslint-disable-next-line
          const precision = this.view.getBigUint64(inp + 16, true);
          const flags = this.view.getUint16(inp + 24, true);

          let wait = timeout;

          if (flags === constants.WASI_SUBSCRIPTION_CLOCK_ABSTIME) {
            wait -= io.now(id);

            if (wait < BigInt(0))
              wait = BigInt(0);
          }

          if (timer === null || wait > timer)
            timer = wait;

          this.view.setBigUint64(out + 0, userdata, true);
          this.view.setUint16(out + 8, constants.WASI_ESUCCESS, true);
          this.view.setUint8(out + 10, type);
          this.view.setBigUint64(out + 16, BigInt(0), true);
          this.view.setUint16(out + 24, 0, true);

          break;
        }

        case constants.WASI_EVENTTYPE_FD_READ:
        case constants.WASI_EVENTTYPE_FD_WRITE: {
          const fd = this.view.getUint32(inp, true);

          let rights = constants.WASI_RIGHT_POLL_FD_READWRITE;

          if (type === constants.WASI_EVENTTYPE_FD_READ)
            rights |= constants.WASI_RIGHT_FD_READ;
          else
            rights |= constants.WASI_RIGHT_FD_WRITE;

          this.check(fd, rights);

          this.view.setBigUint64(out + 0, userdata, true);
          this.view.setUint16(out + 8, constants.WASI_ENOSYS, true);
          this.view.setUint8(out + 10, type);
          this.view.setBigUint64(out + 16, BigInt(0), true);
          this.view.setUint16(out + 24, 0, true);

          break;
        }

        default: {
          return constants.WASI_EINVAL;
        }
      }

      inp += 32;
      out += 32;
      cnt += 1;
    }

    if (timer !== null)
      io.nanosleep(timer);

    this.view.setUint32(nevents, cnt, true);

    return constants.WASI_ESUCCESS;
  }

  proc_exit(rval) {
    // void __wasi_proc_exit(
    //   __wasi_exitcode_t rval
    // )
    this.exitCode = rval;

    if (this.returnOnExit)
      throw new WASIExitError(rval);

    io.exit(rval);

    return constants.WASI_ESUCCESS;
  }

  proc_raise(sig) {
    // __wasi_errno_t __wasi_proc_raise(
    //   __wasi_signal_t sig
    // )
    if (maps.signals[sig] == null)
      return constants.WASI_EINVAL;

    io.kill(maps.signals[sig]);

    return constants.WASI_ESUCCESS;
  }

  sched_yield() {
    // __wasi_errno_t __wasi_sched_yield(
    //   void
    // )
    return constants.WASI_ESUCCESS;
  }

  random_get(buf, buf_len) {
    // __wasi_errno_t __wasi_random_get(
    //   uint8_t *buf,
    //   __wasi_size_t buf_len
    // )
    const data = this.buffer.slice(buf, buf + buf_len);

    io.random(data);

    return constants.WASI_ESUCCESS;
  }

  sock_recv(fd, ri_data, ri_data_len, ri_flags, ro_datalen, ro_flags) {
    // __wasi_errno_t __wasi_sock_recv(
    //   __wasi_fd_t fd,
    //   const __wasi_iovec_t *ri_data,
    //   size_t ri_data_len,
    //   __wasi_riflags_t ri_flags,
    //   __wasi_size_t *ro_datalen,
    //   __wasi_roflags_t *ro_flags
    // )
    if (ro_datalen === 0 || ro_flags === 0)
      return constants.WASI_EINVAL;

    return constants.WASI_ENOSYS;
  }

  sock_send(fd, si_data, si_data_len, si_flags, so_datalen) {
    // __wasi_errno_t __wasi_sock_send(
    //   __wasi_fd_t fd,
    //   const __wasi_ciovec_t *si_data,
    //   size_t si_data_len,
    //   __wasi_siflags_t si_flags,
    //   __wasi_size_t *so_datalen
    // )
    if (so_datalen === 0)
      return constants.WASI_EINVAL;

    return constants.WASI_ENOSYS;
  }

  sock_shutdown(fd, how) {
    // __wasi_errno_t __wasi_sock_shutdown(
    //   __wasi_fd_t fd,
    //   __wasi_sdflags_t how
    // )
    this.check(fd, constants.WASI_RIGHT_SOCK_SHUTDOWN);
    return constants.WASI_ENOSYS;
  }

  toAPI() {
    return {
      args_get: wrap(this.args_get, this),
      args_sizes_get: wrap(this.args_sizes_get, this),
      environ_get: wrap(this.environ_get, this),
      environ_sizes_get: wrap(this.environ_sizes_get, this),
      clock_res_get: wrap(this.clock_res_get, this),
      clock_time_get: wrap(this.clock_time_get, this),
      fd_advise: wrap(this.fd_advise, this),
      fd_allocate: wrap(this.fd_allocate, this),
      fd_close: wrap(this.fd_close, this),
      fd_datasync: wrap(this.fd_datasync, this),
      fd_fdstat_get: wrap(this.fd_fdstat_get, this),
      fd_fdstat_set_flags: wrap(this.fd_fdstat_set_flags, this),
      fd_fdstat_set_rights: wrap(this.fd_fdstat_set_rights, this),
      fd_filestat_get: wrap(this.fd_filestat_get, this),
      fd_filestat_set_size: wrap(this.fd_filestat_set_size, this),
      fd_filestat_set_times: wrap(this.fd_filestat_set_times, this),
      fd_pread: wrap(this.fd_pread, this),
      fd_prestat_get: wrap(this.fd_prestat_get, this),
      fd_prestat_dir_name: wrap(this.fd_prestat_dir_name, this),
      fd_pwrite: wrap(this.fd_pwrite, this),
      fd_read: wrap(this.fd_read, this),
      fd_readdir: wrap(this.fd_readdir, this),
      fd_renumber: wrap(this.fd_renumber, this),
      fd_seek: wrap(this.fd_seek, this),
      fd_sync: wrap(this.fd_sync, this),
      fd_tell: wrap(this.fd_tell, this),
      fd_write: wrap(this.fd_write, this),
      path_create_directory: wrap(this.path_create_directory, this),
      path_filestat_get: wrap(this.path_filestat_get, this),
      path_filestat_set_times: wrap(this.path_filestat_set_times, this),
      path_link: wrap(this.path_link, this),
      path_open: wrap(this.path_open, this),
      path_readlink: wrap(this.path_readlink, this),
      path_remove_directory: wrap(this.path_remove_directory, this),
      path_rename: wrap(this.path_rename, this),
      path_symlink: wrap(this.path_symlink, this),
      path_unlink_file: wrap(this.path_unlink_file, this),
      poll_oneoff: wrap(this.poll_oneoff, this),
      proc_exit: wrap(this.proc_exit, this),
      proc_raise: wrap(this.proc_raise, this),
      sched_yield: wrap(this.sched_yield, this),
      random_get: wrap(this.random_get, this),
      sock_recv: wrap(this.sock_recv, this),
      sock_send: wrap(this.sock_send, this),
      sock_shutdown: wrap(this.sock_shutdown, this)
    };
  }
}

/*
 * Static
 */

WASI.kSetMemory = 'setMemory';

/*
 * Helpers
 */

function isSafeU64(n) {
  return n >= BigInt(0) && n <= MAX_SAFE_BIGINT;
}

function toNumber(n) {
  if (!isSafeU64(n))
    throw new WASIError(constants.WASI_EINVAL);

  return Number(n);
}

function millisec(time) {
  return toNumber(time / BigInt(1e6));
}

function nanosec(time) {
  const msec = Math.floor(time);
  const rest = BigInt(Math.round((time - msec) * 1e6));
  const nsec = BigInt(msec) * BigInt(1e6);

  return nsec + rest;
}

function convertError(err) {
  if (err == null)
    return constants.WASI_EINVAL;

  if (err instanceof WASIError)
    return err.errno & 0xffff;

  if (err instanceof WASIExitError)
    throw err;

  if (err instanceof WASIKillError)
    throw err;

  if (err instanceof AssertionError)
    throw err;

  if (err.errno != null && maps.errors[err.code] != null)
    return maps.errors[err.code];

  return constants.WASI_EINVAL;
}

function wrap(fn, wasi) {
  return (...args) => {
    try {
      return fn.apply(wasi, args);
    } catch (e) {
      return convertError(e);
    }
  };
}

function isSeekable(type) {
  return type === constants.WASI_FILETYPE_BLOCK_DEVICE
      || type === constants.WASI_FILETYPE_REGULAR_FILE;
}

function convertStats(stats, handle) {
  if (stats.isBlockDevice()) {
    return [
      constants.WASI_FILETYPE_BLOCK_DEVICE,
      constants.RIGHTS_BLOCK_DEVICE_BASE,
      constants.RIGHTS_BLOCK_DEVICE_INHERITING
    ];
  }

  if (stats.isCharacterDevice()) {
    if (handle != null && io.isatty && io.isatty(handle)) {
      return [
        constants.WASI_FILETYPE_CHARACTER_DEVICE,
        constants.RIGHTS_TTY_BASE,
        constants.RIGHTS_TTY_INHERITING
      ];
    }

    return [
      constants.WASI_FILETYPE_CHARACTER_DEVICE,
      constants.RIGHTS_CHARACTER_DEVICE_BASE,
      constants.RIGHTS_CHARACTER_DEVICE_INHERITING
    ];
  }

  if (stats.isDirectory()) {
    return [
      constants.WASI_FILETYPE_DIRECTORY,
      constants.RIGHTS_DIRECTORY_BASE,
      constants.RIGHTS_DIRECTORY_INHERITING
    ];
  }

  if (stats.isFIFO()) {
    return [
      constants.WASI_FILETYPE_SOCKET_STREAM,
      constants.RIGHTS_SOCKET_BASE,
      constants.RIGHTS_SOCKET_INHERITING
    ];
  }

  if (stats.isFile()) {
    return [
      constants.WASI_FILETYPE_REGULAR_FILE,
      constants.RIGHTS_REGULAR_FILE_BASE,
      constants.RIGHTS_REGULAR_FILE_INHERITING
    ];
  }

  if (stats.isSocket()) {
    return [
      constants.WASI_FILETYPE_SOCKET_STREAM,
      constants.RIGHTS_SOCKET_BASE,
      constants.RIGHTS_SOCKET_INHERITING
    ];
  }

  if (stats.isSymbolicLink()) {
    return [
      constants.WASI_FILETYPE_SYMBOLIC_LINK,
      BigInt(0),
      BigInt(0)
    ];
  }

  return [
    constants.WASI_FILETYPE_UNKNOWN,
    BigInt(0),
    BigInt(0)
  ];
};

function getFileType(stats, handle) {
  return convertStats(stats, handle)[0];
}

function safeRealpath(path) {
  assert(io.fs);
  assert(io.path);

  try {
    return io.fs.realpathSync(path);
  } catch (e) {
    if (e.code !== 'ENOENT')
      throw e;
  }

  const real = io.fs.realpathSync(io.path.dirname(path));
  const base = io.path.basename(path);

  return io.path.join(real, base);
}

function isSandboxed(child, root) {
  assert(io.path);
  assert(io.path.isAbsolute(root));

  if (child.includes('\0'))
    return false;

  if (child === root)
    return true;

  return child.startsWith(root + io.path.sep);
}

function isUnreachableError(error) {
  return error != null
    && error.name === 'RuntimeError'
    && error.message === 'unreachable';
}

/*
 * Expose
 */

module.exports = WASI;
