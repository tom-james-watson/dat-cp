/*
 * This is lifted pretty much directly from
 * https://github.com/datproject/dat-storage/blob/master/index.js
 *
 * Pretty much the only difference, other than cleaning up a few now uneeded
 * things, is that the metadata and content functions now use ram as their
 * storage UNLESS we are dealing with the actual data, in which case use dat's
 * normal approach.
 *
 * See https://github.com/datproject/dat-node/issues/222 for more detail.
 * Potentially ram for metadata only should be an option in dat-node.
 */
import path from 'path'
import raf from 'random-access-file'
import ram from 'random-access-memory'
import multi from 'multi-random-access'
import messages from 'append-tree/messages'
import {Stat} from 'hyperdrive/lib/messages'

module.exports = function(dir, opts={}) {
  const prefix = opts.prefix || '.dat/'

  return {
    metadata: function(name, metaOpts) {
      return ram(path.join(dir, prefix + 'metadata.' + name))
    },
    content: function(name, contentOpts, archive) {
      if (!archive) {
        archive = contentOpts
      }

      if (name === 'data') {
        return createStorage(archive, dir)
      }

      return ram(path.join(dir, prefix + 'content.' + name))
    }
  }
}

function createStorage(archive, dir) {

  const latest = archive.latest
  let head = null
  const storage = multi({limit: 128}, locate)

  archive.on('appending', onappending)
  archive.on('append', onappend)

  return storage

  function onappend(name, opts) {
    if (head) {
      head.end = archive.content.byteLength
    }
  }

  function onappending(name, opts) {
    if (head) {
      head.end = archive.content.byteLength
    }

    const v = latest ? '' : '.' + archive.metadata.length

    head = {
      start: archive.content.byteLength,
      end: Infinity,
      storage: file(name + v, opts)
    }

    storage.add(head)
  }

  function locate(offset, cb) {
    archive.ready(function(err) {
      if (err) {
        return cb(err)
      }

      find(archive.metadata, offset, function(err, node, st, index) {
        if (err) {
          return cb(err)
        }

        if (!node) {
          return cb(new Error('Could not locate data'))
        }

        const v = latest ? '' : '.' + index

        cb(null, {
          start: st.byteOffset,
          end: st.byteOffset + st.size,
          storage: file(node.name + v)
        })
      })
    })
  }

  function file(name, opts={}) {
    let directory = '.'
    if (opts.path) {
      const parsed = path.parse(opts.path)
      name = parsed.base
      directory = parsed.dir
    }
    return raf(name, {directory, rmdir: true})
  }
}

function get(metadata, btm, seq, cb) {
  if (seq < btm) {
    return cb(null, -1, null)
  }

  let i = seq

  while (!metadata.has(i) && i > btm) {
    i--
  }

  if (!metadata.has(i)) {
    return cb(null, -1, null)
  }

  metadata.get(i, {valueEncoding: messages.Node}, function(err, node) {
    if (err) {
      return cb(err)
    }

    const st = node.value && Stat.decode(node.value)

    if (!node.value || (!st.offset && !st.blocks) || (!st.byteOffset && !st.blocks)) {
      return get(metadata, btm, i - 1, cb)
    }

    cb(null, i, node, st)
  })
}

function find(metadata, bytes, cb) {
  let top = metadata.length - 1
  let btm = 1
  let mid = Math.floor((top + btm) / 2)

  get(metadata, btm, mid, function loop(err, actual, node, st) {
    if (err) {
      return cb(err)
    }

    const oldMid = mid

    if (!node) {
      btm = mid
      mid = Math.floor((top + btm) / 2)
    } else {
      const start = st.byteOffset
      const end = st.byteOffset + st.size

      if (start <= bytes && bytes < end) {
        return cb(null, node, st, actual)
      }
      if (top <= btm) {
        return cb(null, null, null, -1)
      }

      if (bytes < start) {
        top = mid
        mid = Math.floor((top + btm) / 2)
      } else {
        btm = mid
        mid = Math.floor((top + btm) / 2)
      }
    }

    if (mid === oldMid) {
      if (btm < top) {
        mid++
      } else {
        return cb(null, null, null, -1)
      }
    }

    get(metadata, btm, mid, loop)
  })
}
