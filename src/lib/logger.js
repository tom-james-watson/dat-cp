import winston from 'winston'

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info'
    })
  ],
  format: winston.format.printf((info) => {
    if (info.level === 'debug') {
      return `debug: ${info.message}`
    }

    return info.message
  })
})

export default logger
