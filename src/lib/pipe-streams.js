import ProgressBar from 'progress'

export default function pipeStreams(readStream, writeStream, filesize, label) {
  return new Promise(async (resolve) => {
    const width = process.stdout.columns < 100 ? process.stdout.columns - 30 : 50
    label = label.substr(0, width).padEnd(width, ' ')

    const bar = new ProgressBar(
      `${label} [:bar] :percent`,
      {
        incomplete: ' ',
        width: 20,
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
