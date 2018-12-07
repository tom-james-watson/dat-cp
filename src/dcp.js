#! /usr/bin/env node

import program from 'commander'
import send from './send'
import logger from './lib/logger'
import receive from './receive'
import pkgJson from '../package.json'

program.on('--help', function() {
  console.log('\nExample:')
  console.log('\n    Send files from host A:')
  console.log(`
        > dcp foo.txt bar.txt
  `)
  console.log('    Receive files on host B:')
  console.log(`
        > dcp <generated public key>
  `)
})

program
  .version(pkgJson.version)
  .usage('[options] {source ... | key}')
  .description('Dat Copy - remote file copy, powered by the dat protocol.')
  .option('-r, --recursive', 'recursively copy directories')
  .option('-n, --dry-run', 'show what files would have been copied')
  .option('-v, --verbose', 'verbose mode - prints extra debugging messages')
  .parse(process.argv)

if (!process.argv.slice(2).length || !program.args.length) {
  program.outputHelp()
  process.exit(1)
}

if (program.verbose) {
  logger.enableDebug()
}

if (program.args[0].length === 64) {
  receive(program.args[0], program)
} else {
  send(program.args, program)
}

process.on('unhandledRejection', (reason, promise) => {
  console.error({reason, promise})
})
