import Dat from './lib/dat'
import DatCp from './lib/dat-cp'

export default async function receive(key, program) {
  const dat = await Dat({key, sparse: true})

  const datCp = new DatCp(dat, program)

  if (!program.skipPrompt) {
    await datCp.download(true)
  }

  if (program.dryRun || (!program.skipPrompt && datCp.files === 0)) {
    process.exit()
  }

  if (!program.skipPrompt) {
    const proceed = await datCp.downloadPrompt()

    if (!proceed) {
      process.exit()
    }
  }

  datCp.resetCounts()
  await datCp.download()

  process.exit()
}
