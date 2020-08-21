import fs from 'fs'

function readdir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        return reject(err)
      }
      resolve(files)
    })
  })
}

function lstat(path) {
  return new Promise((resolve, reject) => {
    fs.lstat(path, (err, stats) => {
      if (err) {
        return reject(err)
      }
      resolve(stats)
    })
  })
}

function mkdir(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, {recursive: true}, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

export default {
  readdir,
  lstat,
  mkdir,
  createReadStream: fs.createReadStream,
  createWriteStream: fs.createWriteStream
}
