import Dcp from './lib/dcp'

export default async function receive(key) {
  console.log('receive', {key})
  const dcp = new Dcp()
  await dcp.connect({key})
  await dcp.download()
  console.log('Done.')
  process.exit()
}
