import DatCp from './lib/dat-cp'

export default async function receive(key, program) {
  const datCp = new DatCp(program, {key, sparse: true})
  await datCp.connect()

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
