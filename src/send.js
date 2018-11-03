import Dcp from './lib/dcp'
import logger from './lib/logger'

export default async function send(paths, program) {
  const dcp = new Dcp(program)
  await dcp.connect()
  await dcp.upload(paths)
  logger.info('\nPaste files on another machine with:\n')
  logger.info(`\tdcp ${dcp.dat.key.toString('hex')}\n`)
}
