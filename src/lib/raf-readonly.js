/*
 * This is lifted pretty much directly from
 * https://github.com/random-access-storage/random-access-file//blob/master/index.js
 *
 * The main differences are:
 * - Removed a few things that are not relevant for my use case.
 * - Neutered the write function in order to make access read only.
 */
var inherits = require('util').inherits
var RandomAccess = require('random-access-storage')
var fs = require('fs')
var path = require('path')
var constants = fs.constants || require('constants')

var READONLY = constants.O_RDONLY

module.exports = RandomAccessFile

function RandomAccessFile (filename, opts = {}) {
  if (!(this instanceof RandomAccessFile)) {
    return new RandomAccessFile(filename, opts)
  }
  RandomAccess.call(this)

  if (opts.directory) {
    filename = path.join(opts.directory, filename)
  }

  this.filename = filename
  this.fd = 0
}

inherits(RandomAccessFile, RandomAccess)

RandomAccessFile.prototype._open = function (req) {
  var self = this

  fs.open(self.filename, READONLY, onopen)

  function onopen (err, fd) {
    if (err) {
      return req.callback(err)
    }

    self.fd = fd
    return req.callback(null)
  }
}

RandomAccessFile.prototype._write = function (req) {
  // Do nothing - we are writing files to archive that already exist on disk.
  // If we don't specify this function then random-access-storage errors.
  req.callback(null)
}

RandomAccessFile.prototype._read = function (req) {
  var data = req.data || Buffer.allocUnsafe(req.size)
  var fd = this.fd

  if (!req.size) {
    return process.nextTick(readEmpty, req)
  }
  fs.read(fd, data, 0, req.size, req.offset, onread)

  function onread (err, read) {
    if (err) {
      return req.callback(err)
    }
    if (!read) {
      return req.callback(new Error('Could not satisfy length'))
    }

    req.size -= read
    req.offset += read

    if (!req.size) {
      return req.callback(null, data)
    }

    fs.read(fd, data, data.length - req.size, req.size, req.offset, onread)
  }
}

function readEmpty (req) {
  req.callback(null, Buffer.alloc(0))
}
