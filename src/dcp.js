#! /usr/bin/env node

import program from 'commander'
import send from './send'
import logger from './lib/logger'
import receive from './receive'
import pkgJson from '../package.json'

program
  .version(pkgJson.version)
  .usage('[options] {source ... | key}')
  .description('Dat Copy - remote file copy, powered by the dat protocol.')
  .option('-r, --recursive', 'Recursively copy entire directories')
  .option('-v, --verbose', 'Verbose mode. Causes dcp to print debugging messages about its progress')
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit(1)
}

if (program.verbose) {
  logger.transports[0].level = 'debug'
}

if (program.args[0].length === 64) {
  receive(program.args[0], program)
} else {
  send(program.args, program)
}

process.on('unhandledRejection', (reason, promise) => {
  console.error({reason, promise})
})
