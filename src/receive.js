import Dat from './lib/dat'
import DatCp from './lib/dat-cp'

export default async function receive(args, options) {

  let key = args[0];
  let path = args[1] ? args[1] : '.';

  const dat = await Dat({key, sparse: true})

  if (!options.skipPrompt) {
    const datCpDryRun = new DatCp(dat, {...options, dryRun: true})

    await datCpDryRun.setDownloadDest(path);
    await datCpDryRun.download()

    if (options.dryRun || datCpDryRun.files === 0) {
      datCpDryRun.printTotal()
      process.exit()
    }

    const proceed = await datCpDryRun.downloadPrompt()

    if (!proceed) {
      process.exit()
    }
  }

  const datCpDownload = new DatCp(dat, {...options})

  await datCpDownload.download()

  if (options.skipPrompt || datCpDownload.files > 30) {
    datCpDownload.printTotal()
  }

  process.exit()
}
