import chalk from 'chalk'

const logger = {
  debug: function() {},
  info: function() {
    console.log(...arguments)
  },
  warn: function() {
    console.warn(`dcp ${chalk.yellow('WARN')}`, ...arguments)
  },
  error: function() {
    console.error(`dcp ${chalk.red('ERR')}`, ...arguments)
  },
  enableDebug: function() {
    this.debug = function() {
      console.log(`dcp ${chalk.blue('DEBUG')}`, ...arguments)
    }
  }
}

export default logger
