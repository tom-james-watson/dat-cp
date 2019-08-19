import fs from './fs'
import nodePath from 'path'
import logger from './logger'
import pipeStreams from './pipe-streams'
import {formatSize} from './format-size'
import prompt from './prompt'

export default class DatCp {

  constructor(dat, options) {
    this.dat = dat
    this.options = options
    this.files = 0
    this.totalSize = 0
  }

  async upload(paths) {
    await this.ensurePathsValid(paths)

    if (this.options.dryRun) {
      this.printTotal()
      process.exit(0)
    }

    logger.debug('Creating metadata for files:')
    for (const path of paths) {
      await this.uploadPath(path, '')
    }

    this.printTotal()
  }

  async ensurePathsValid(paths) {
    this.count = 0

    for (const path of paths) {
      await this.ensurePathValid(path)
    }

    if (!this.files) {
      logger.error(`No files to copy.`)
      process.exit(1)
    }
  }

  async ensurePathValid(path) {
    let stats

    try {
      stats = await fs.lstat(path)
    } catch (err) {
      logger.error(`${path}: No such file or directory.`)
      process.exit(1)
    }

    if (stats.isFile()) {
      this.countPath(path, stats)
      return
    }

    if (stats.isDirectory()) {
      return await this.ensureDirValid(path, stats)
    }

    logger.warn(`${path}: Not a file or directory (not copied).`)
    return
  }

  async ensureDirValid(path, stats) {
    if (!this.options.recursive) {
      logger.warn(`${path}: Is a directory (not copied).`)
      return
    }

    if (path[path.length - 1] !== '/') {
      this.countPath(path, stats)
    }

    const dirPaths = await fs.readdir(path)

    for (const dirPath of dirPaths) {
      await this.ensurePathValid(nodePath.join(path, dirPath))
    }
  }

  async uploadPath(path, datPath) {
    const stats = await fs.lstat(path)

    if (stats.isFile()) {
      await this.uploadFile(path, datPath)
    } else if (stats.isDirectory()) {
      await this.uploadDir(path, datPath)
    }
  }

  async uploadFile(path, datPath) {
    datPath = nodePath.join(datPath, nodePath.parse(path).base)
    const stats = await fs.lstat(path)
    const filesize = stats.size || 1

    const readStream = fs.createReadStream(path)
    const writeStream = this.dat.createWriteStream(datPath, {path})

    await pipeStreams(readStream, writeStream, filesize, datPath)
  }

  async uploadDir(path, datPath) {
    if (!this.options.recursive) {
      return
    }

    // If a source dir ends with `/`, copy its contents, not the dir itself
    if (path[path.length - 1] !== '/') {
      datPath = nodePath.join(datPath, nodePath.parse(path).base)
      await this.mkdir(datPath)
    }

    const dirPaths = await fs.readdir(path)

    for (const dirPath of dirPaths) {
      await this.uploadPath(nodePath.join(path, dirPath), datPath)
    }
  }

  mkdir(path) {
    return new Promise((resolve) => {
      this.dat.mkdir(path, (err) => {
        if (err) {
          logger.error(err.toString())
          logger.error(`${path}: Failed to create directory in dat archive.`)
          process.exit(1)
        }
        resolve()
      })
    })
  }

  download() {
    return new Promise((resolve) => {
      const abort = setTimeout(() => {
        logger.error('Failed to download metadata from peer.')
        process.exit(1)
      }, 15000)

      const readRoot = async () => {
        const paths = await this.readdir('/')

        if (paths.length !== 0) {
          clearTimeout(abort)

          for (const path of paths) {
            await this.downloadPath(path)
          }

          resolve()
        } else {
          setTimeout(readRoot, 300)
        }
      }

      readRoot()
    })
  }

  async downloadPath(path) {
    const stats = await this.stat(path)

    if (stats.isDirectory()) {
      await this.downloadDir(path, stats)
    } else {
      await this.downloadFile(path, stats)
    }
  }

  async downloadFile(path, stats) {
    // If the file exists and is the same size, assume that it hasn't changed
    // and skip it.
    try {
      const fsStats = await fs.lstat(path)
      if (stats.size === fsStats.size) {
        logger.warn(`${path}: File is identical (not copied).`)
        return
      }
    } catch (err) {
      // File doesn't exist, do nothing.
    }

    this.countPath(path, stats)

    if (this.options.dryRun) {
      return
    }

    const readStream = this.dat.createReadStream(path)
    const writeStream = fs.createWriteStream(path)
    const filesize = stats.size || 1

    await pipeStreams(readStream, writeStream, filesize, path)
  }

  async downloadDir(path, stats) {
    if (!this.options.dryRun) {
      // lstat will throw an error if a path does not exist, so rely on that to
      // know that the dir does not already exist. If the path exists and is not
      // a directory, error.
      try {
        const stats = await fs.lstat(path)
        if (!stats.isDirectory()) {
          logger.error(`${path}: Not a directory.`)
          process.exit(1)
        }
      } catch (err) {
        await fs.mkdir(path)
      }
    }

    this.countPath(path, stats)

    const dirPaths = await this.readdir(path)

    for (const dirPath of dirPaths) {
      await this.downloadPath(nodePath.join(path, dirPath))
    }
  }

  countPath(path, stats) {
    if (path === '.') {
      return
    }

    this.files += 1
    this.totalSize += stats.size

    if (!this.options.dryRun) {
      return
    }

    if (stats.isFile()) {
      logger.info(`${formatSize(stats.size).padEnd(8)} ${path}`)
    } else if (stats.isDirectory()) {
      logger.info(`${'-'.padEnd(8)} ${path}`)
    }
  }

  printTotal() {
    logger.info(`\nTotal: ${this.files} files (${formatSize(this.totalSize)})`)
  }

  async downloadPrompt() {
    const answer = await prompt(
      `\nDownload ${this.files} files (${formatSize(this.totalSize)})? [Y/n] `
    )

    const proceed = ['yes', 'y', ''].includes(answer.trim().toLowerCase())

    if (proceed) {
      logger.info()
    }

    return proceed
  }

  readdir(path) {
    return new Promise((resolve, reject) => {
      this.dat.readdir(path, async (err, paths) => {
        if (err) {
          logger.error(err.toString())
          logger.error(`${path}: Failed to read from dat archive.`)
          process.exit(1)
        }
        resolve(paths)
      })
    })
  }

  stat(path) {
    return new Promise((resolve, reject) => {
      this.dat.stat(path, (err, stats) => {
        if (err) {
          logger.error(err.toString())
          logger.error(`${path}: Failed to get stats from dat archive.`)
          process.exit(1)
        }
        resolve(stats)
      })
    })
  }

}
