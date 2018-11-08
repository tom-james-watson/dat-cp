import cliProgress from 'cli-progress'
import chalk from 'chalk'

export default function pipeStreams(readStream, writeStream, filesize, label) {
  return new Promise(async (resolve) => {

    const sizeMags = ['B', 'KB', 'MB', 'GB']
    const sizeMag = Math.floor(Math.log(filesize) / Math.log(1024))

    function formatSize(bytes) {
      if (bytes === 0) {
        return '0B'
      }
      return parseFloat((bytes / Math.pow(1024, sizeMag)).toFixed(2))
    }

    const labelWidth = (process.stdout.columns / 3).toFixed()
    label = label.substr(0, labelWidth).padEnd(labelWidth, ' ')

    const progress = new cliProgress.Bar({
      format: `${label} [${chalk.green('{bar}')}] {percentage}% | {duration_formatted} | {transfer} {sizeMag}`,
    }, cliProgress.Presets.legacy)

    progress.start(filesize, 0, {
      transfer: `${formatSize(0)} / ${formatSize(filesize)}`,
      sizeMag: sizeMags[sizeMag]
    })

    readStream.on('data', function(buffer) {
      progress.increment(buffer.length, {
        transfer: `${formatSize(progress.value)} / ${formatSize(filesize)}`,
      })
    })

    readStream.pipe(writeStream)

    writeStream.on('finish', () => {
      progress.update(filesize, {
        transfer: formatSize(filesize),
      })
      progress.stop()
      resolve()
    })
  })
}
