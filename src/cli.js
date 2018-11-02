#! /usr/bin/env node

import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))

if (argv.h || argv.help) {
  console.log('Usage:\n')
  console.log('git-publish-npm <github repo> <version/tag> [--help] [--http] [-v]')
  console.log('\ne.g. git-publish-npm tom-james-watson/gitpublish-npm 0.1.0')
  process.exit(0)
}

console.log(argv)
