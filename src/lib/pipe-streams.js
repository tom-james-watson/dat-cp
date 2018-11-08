import ProgressBar from 'progress'
import chalk from 'chalk'

export default function pipeStreams(readStream, writeStream, filesize, label) {
  return new Promise(async (resolve) => {

    const labelWidth = ((process.stdout.columns / 5) * 2).toFixed()
    const barWidth = ((process.stdout.columns / 5) * 1.5).toFixed()

    label = label.substr(0, labelWidth).padEnd(labelWidth, ' ')

    // const  style = 'downloading [' + chalk.magenta(':bar') + '] :rate/bps ' + chalk.green(':percent') + ' :etas'
    let style = `${label} [${chalk.green(':bar')}] ${chalk.magenta(':percent')}`

    if (process.stdout.columns > 100) {
      style += chalk.magenta(' :totalB :elapseds')
    }

    const bar = new ProgressBar(
      style,
      {
        incomplete: ' ',
        total: filesize,
        renderThrottle: 0,
        width: barWidth
      }
    )

    readStream.on('data', function(buffer) {
      bar.tick(buffer.length)
    })

    readStream.pipe(writeStream)

    writeStream.on('finish', () => {
      resolve()
    })
  })
}
