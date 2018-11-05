import ProgressBar from 'progress'

export default function pipeStreams(readStream, writeStream, filesize, label) {
  return new Promise(async (resolve) => {

    const labelWidth = ((process.stdout.columns / 3) * 2 - 5).toFixed()
    const barWidth = (process.stdout.columns / 3 - 5).toFixed()

    label = label.substr(0, labelWidth).padEnd(labelWidth, ' ')

    const bar = new ProgressBar(
      `${label} [:bar] :percent`,
      {
        incomplete: ' ',
        width: barWidth,
        total: filesize
      }
    )

    readStream.on('data', function(buffer) {
      bar.tick(buffer.length)
    })

    readStream.pipe(writeStream)

    writeStream.on('finish', () => {
      if (!bar.complete) {
        bar.tick(bar.total - bar.curr)
      }
      resolve()
    })
  })
}
