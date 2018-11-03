import fs from 'fs'
import nodePath from 'path'
import {promisify} from 'util'
import Dat from 'dat-node'
import ProgressBar from 'progress'
import checkError from './check-error'
import logger from './logger'

const fsReaddir = promisify(fs.readdir)
const fsLstat = promisify(fs.lstat)
const fsMkdir = promisify(fs.mkdir)

export default class Dcp {

  constructor(program, options = {}) {
    this.program = program
    this.options = options
  }

  connect() {
    return new Promise((resolve) => {
      Dat('.', {temp: true, ...this.options}, async (err, dat) => {
        checkError(err)

        this.dat = dat
        dat.trackStats()

        await this.joinNetwork()
        resolve()
      })
    })
  }

  joinNetwork() {
    return new Promise((resolve, reject) => {
      logger.debug('Connecting to Dat network')

      this.dat.joinNetwork()

      if (!this.options.key) {
        this.dat.network.on('connection', function (connection, info) {
          logger.debug('Peer started download.')
        })
        return resolve()
      }

      const abort = setTimeout(() => {
        logger.error('Failed to connect to any peers.')
        process.exit(1)
      }, 15000)

      const connect = setInterval(() => {
        if (this.dat.stats.peers.complete > 0) {
          logger.debug('Connected to upload peer.')
          clearInterval(connect)
          clearTimeout(abort)
          resolve()
        }
      }, 300)
    })
  }

  async upload(paths) {
    for (const path of paths) {
      await this.uploadPath(path, '/')
    }
  }

  async uploadPath(path, datPath) {
    const stats = await fsLstat(path)

    if (stats.isFile()) {
      await this.uploadFile(path, datPath)
    } else if (stats.isDirectory()) {
      await this.uploadDir(path, datPath)
    } else {
      logger.warn(`dcp: ${path} is not a file or directory (not copied).`)
    }
  }

  mkdir(path) {
    return new Promise((resolve) => {
      this.dat.archive.mkdir(path, (err) => {
        checkError(err)
        resolve()
      })
    })
  }

  pipeStreams(readStream, writeStream, filesize, filename) {
    return new Promise(async (resolve) => {
      const width = process.stdout.columns < 100 ? process.stdout.columns / 2 : 40
      filename = filename.substr(0, width).padEnd(width, ' ')

      const bar = new ProgressBar(
        `${filename} [:bar] :percent`,
        {
          incomplete: ' ',
          width: 20,
          total: filesize
        }
      )

      readStream.on('data', function(buffer) {
        bar.tick(buffer.length)
      })

      readStream.pipe(writeStream)

      writeStream.on('finish', () => {
        if (!bar.complete) {
          bar.tick(bar.total - bar.curr)
        }
        resolve()
      })
    })
  }

  async uploadFile(path, datPath) {
    const filename = nodePath.parse(path).base
    datPath = nodePath.join(datPath, filename)
    const stat = await fsLstat(path)
    const filesize = stat.size || 1

    const readStream = fs.createReadStream(path)
    const writeStream = this.dat.archive.createWriteStream(datPath)

    await this.pipeStreams(readStream, writeStream, filesize, filename)
  }

  async uploadDir(path, datPath) {
    if (!this.program.recursive) {
      logger.info(`dcp: ${path} is a directory (not copied).`)
      return
    }

    // If a source dir ends with `/`, copy its contents, not the dir itself
    if (path[path.length - 1] !== '/') {
      datPath = nodePath.join(datPath, nodePath.parse(path).base)
      await this.mkdir(datPath)
    }

    const dirPaths = await fsReaddir(path)

    for (const dirPath of dirPaths) {
      await this.uploadPath(nodePath.join(path, dirPath), datPath)
    }
  }

  async download() {
    const paths = await this.readdir('/')

    for (const path of paths) {
      await this.downloadPath(path)
    }
  }

  async downloadPath(path) {
    const stat = await this.stat(path)

    if (stat.isDirectory()) {
      await this.downloadDir(path)
    } else {
      await this.downloadFile(path)
    }
  }

  downloadFile(path) {
    return new Promise((resolve) => {
      const readStream = this.dat.archive.createReadStream(path)
      const writeStream = fs.createWriteStream(path)
      this.dat.archive.stat(path, async (err, stat) => {
        const filesize = stat.size || 1

        await this.pipeStreams(readStream, writeStream, filesize, path)
        resolve()
      })
    })
  }

  async downloadDir(path) {
    // lstat will throw an error if a path does not exist, so rely on that to
    // know that the dir does not already exist. If the path exists and is not
    // a directory, error.
    try {
      const stats = await fsLstat(path)
      if (!stats.isDirectory()) {
        logger.error(`dcp: ${path}: not a directory`)
        process.exit(1)
      }
    } catch (err) {
      await fsMkdir(path)
    }

    const dirPaths = await this.readdir(path)

    for (const dirPath of dirPaths) {
      await this.downloadPath(nodePath.join(path, dirPath))
    }
  }

  readdir(path) {
    return new Promise((resolve, reject) => {
      this.dat.archive.readdir(path, async (err, paths) => {
        checkError(err)
        resolve(paths)
      })
    })
  }

  stat(path) {
    return new Promise((resolve, reject) => {
      this.dat.archive.stat(path, (err, stat) => {
        checkError(err)
        resolve(stat)
      })
    })
  }

}
