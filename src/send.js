import chalk from 'chalk'
import Dat from './lib/dat'
import DatCp from './lib/dat-cp'
import logger from './lib/logger'
import monitorUpload from './lib/monitor-upload'

export default async function send(paths, options) {
  const dat = await Dat()

  const datCp = new DatCp(dat, options)
  await datCp.upload(paths)

  logger.info('\nPaste files on another host with:\n')
  logger.info(chalk.cyan(`\tdcp ${datCp.dat.key.toString('hex')}\n`))

  monitorUpload(datCp.dat)
}
