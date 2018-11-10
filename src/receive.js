import DatCp from './lib/dat-cp'

export default async function receive(key, program) {
  const datCp = new DatCp(program, {key, sparse: true})
  await datCp.connect()
  await datCp.download()
  process.exit()
}
