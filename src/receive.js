import DatCp from './lib/dat-cp'

export default async function receive(key, program) {
  const datCp = new DatCp(program, {key, sparse: true})
  await datCp.connect()

  if (!program.yes) {
    await datCp.download(true)
  }

  if (program.dryRun || (!program.yes && datCp.files === 0)) {
    process.exit()
  }

  if (!program.yes) {
    const proceed = await datCp.downloadPrompt()

    if (!proceed) {
      process.exit()
    }
  }

  datCp.resetCounts()
  await datCp.download()

  process.exit()
}
