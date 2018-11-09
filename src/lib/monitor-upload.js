import cliProgress from 'cli-progress'

function formatSize(bytes) {
  if (bytes === 0) {
    return '0B'
  }

  const sizeMags = ['B', 'KB', 'MB', 'GB']
  const sizeMag = Math.floor(Math.log(bytes) / Math.log(1024))

  return (bytes / Math.pow(1024, sizeMag)).toFixed(2) + sizeMags[sizeMag]
}

export default function monitorUploads(dat) {

  const progress = new cliProgress.Bar({
    format: `Total: {uploadTotal} | Uploading: {uploadSpeed}/s`,
  }, cliProgress.Presets.legacy)

  progress.start(0, 0, {
    peersConnected: 0,
    uploadTotal: formatSize(0),
    uploadSpeed: formatSize(0),
  })

  setInterval(() => {
    progress.update(0, {
      uploadTotal: formatSize(dat.stats.network.uploadTotal),
      uploadSpeed: formatSize(dat.stats.network.uploadSpeed),
    })
  }, 300)
}
