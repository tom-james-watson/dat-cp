import Dcp from './lib/dcp'

export default async function receive(key, program) {
  const dcp = new Dcp(program, {key})
  await dcp.connect()
  await dcp.download()
  process.exit()
}
