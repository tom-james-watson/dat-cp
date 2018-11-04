const logger = {
  debug: function() {},
  info: function() {
    console.log(...arguments)
  },
  warn: function() {
    console.warn(...arguments)
  },
  error: function() {
    console.error(...arguments)
  },
  enableDebug: function() {
    this.debug = function() {
      console.log('debug:', ...arguments)
    }
  }
}

export default logger
