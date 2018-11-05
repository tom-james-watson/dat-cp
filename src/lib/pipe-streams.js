import ProgressBar from 'progress'

export default function pipeStreams(readStream, writeStream, filesize, filename) {
  return new Promise(async (resolve) => {
    const width = process.stdout.columns < 100 ? process.stdout.columns / 2 : 40
    filename = filename.substr(0, width).padEnd(width, ' ')

    const bar = new ProgressBar(
      `${filename} [:bar] :percent`,
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
