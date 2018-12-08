import Dat from 'dat-node'
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

export default function(options = {}) {
  return new Promise((resolve, reject) => {

    logger.debug('Creating dat archive.')

    Dat(storage('.'), {...options}, async (err, dat) => {
      if (err) {
        logger.error(err.toString())
        logger.error(`Failed to initialize dat archive.`)
        process.exit(1)
      }

      dat.trackStats()

      logger.debug('Connecting to dat network.')

      dat.joinNetwork()

      if (!options.key) {
        return resolve(dat)
      }

      await waitForUploadPeer(dat)

      resolve(dat)
    })
  })
}
