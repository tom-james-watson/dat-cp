import fs from 'fs'
import nodePath from 'path'
import {promisify} from 'util'
import Dat from 'dat-node'
import checkError from './check-error'

const fsReaddir = promisify(fs.readdir)
const fsReadFile = promisify(fs.readFile)
const fsLstat = promisify(fs.lstat)
const fsWriteFile = promisify(fs.writeFile)
const fsMkdir = promisify(fs.mkdir)

export default class Dcp {

  connect(options = {}) {
    console.log('connect', {options})
    this.options = options
    return new Promise((resolve) => {
      Dat('.', {temp: true, ...options}, async (err, dat) => {
        checkError(err)

        this.dat = dat

        await this.joinNetwork()
        resolve()
      })
    })
  }

  joinNetwork() {
    console.log('joinNetwork')
    return new Promise((resolve, reject) => {

      if (!this.options.key) {
        this.dat.joinNetwork()
        this.dat.network.on('connection', function () {
          console.log('Connected to peer.')
        })
        return resolve()
      }

      this.dat.joinNetwork((err) => {
        checkError(err)
        console.log('joined network')

        if (!this.dat.network.connected || !this.dat.network.connecting) {
          console.error('No peers found for key.')
          process.exit(1)
        }

        resolve()
      })
    })
  }

  async upload(paths) {
    console.log('upload', {paths})
    for (const path of paths) {
      await this.uploadPath(path, '/')
    }
  }

  async uploadPath(path, datPath) {
    console.log('uploadPath', {path, datPath})

    const stats = await fsLstat(path)

    if (stats.isFile()) {
      await this.uploadFile(path, datPath)
    } else if (stats.isDirectory()) {
      await this.uploadDir(path, datPath)
    } else {
      console.warn(`Not a file or a directory: ${path}`)
    }
  }

  mkdir(path) {
    console.log('mkdir', {path})
    return new Promise((resolve) => {
      this.dat.archive.mkdir(path, (err) => {
        checkError(err)
        resolve()
      })
    })
  }

  uploadFile(path, datPath) {
    console.log('uploadFile', {path})
    return new Promise(async (resolve) => {

      datPath = nodePath.join(datPath, nodePath.parse(path).base)

      const data = await fsReadFile(path)

      console.log('datWriteFile', {datPath})
      await this.dat.archive.writeFile(datPath, data, (err) => {
        checkError(err)
        resolve()
      })
    })
  }

  async uploadDir(path, datPath) {
    console.log('uploadDir', {path})

    datPath = nodePath.join(datPath, nodePath.parse(path).base)

    await this.mkdir(datPath)

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
    console.log(`Downloading ${path}`)

    const stat = await this.stat(path)

    if (stat.isDirectory()) {
      await this.downloadDir(path)
    } else {
      await this.downloadFile(path)
    }
  }

  async downloadDir(path) {
    await fsMkdir(path)

    const dirPaths = await this.readdir(path)

    for (const dirPath of dirPaths) {
      await this.downloadPath(nodePath.join(path, dirPath))
    }
  }

  downloadFile(path) {
    return new Promise((resolve, reject) => {
      this.dat.archive.readFile(path, 'utf-8', async (err, data) => {
        checkError(err)

        await fsWriteFile(path, data)
        resolve(data)
      })
    })
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
