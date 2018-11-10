import cliProgress from 'cli-progress'
import {formatSize} from './format-size'

export default function monitorUploads(dat) {

  const progress = new cliProgress.Bar({
    format: `Uploaded: {uploadTotal} | Upload Speed: {uploadSpeed}/s`,
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
