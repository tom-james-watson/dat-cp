#! /usr/bin/env node

import minimist from 'minimist'
import send from './send'
import receive from './receive'

const argv = minimist(process.argv.slice(2))

function usage() {
  console.log('Usage:\n\n')
  console.log('Send:\n')
  console.log('dcp <files>\n')
  console.log('Receive:\n')
  console.log('dcp <key>')
  process.exit(0)
}

if (argv.h || argv.help) {
  usage()
}

console.log(argv)

if (argv._[0].length === 64) {
  receive(argv._[0])
} else {
  send(argv._)
}

process.on('unhandledRejection', (reason, promise) => {
  console.error({reason, promise})
})
