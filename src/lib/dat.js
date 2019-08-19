import Dat from 'dat-node'
const SDK = require('dat-sdk')
const {Hyperdrive} = SDK()
import logger from './logger'
import storage from './storage'

function waitForUploadPeer(dat) {
  return new Promise((resolve) => {
    const abort = setTimeout(() => {
      logger.error('Failed to connect to any peers.')
      process.exit(1)
    }, 15000)

    const connect = setInterval(() => {
      for (const conn of dat.network.connections) {
        if (conn.writable) {
          logger.debug('Connected to upload peer.')
          clearInterval(connect)
          clearTimeout(abort)
          resolve(dat)
        }
      }
    }, 300)
  })
}

export default function(key, options = {}) {
  return new Promise((resolve, reject) => {
    logger.debug('Creating dat archive.')

    const dat = Hyperdrive(key, {storage: storage('.'), ...options})

    dat.ready(() => {
      // dat.trackStats()

      resolve(dat)

      logger.debug('Connecting to dat network.')

      // dat.joinNetwork()

      // if (!options.key) {
      //   return resolve(dat)
      // }

      // await waitForUploadPeer(dat)

      // resolve(dat)
    })
  })
}
