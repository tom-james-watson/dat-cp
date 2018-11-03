import Dcp from './lib/dcp'

export default async function send(paths) {
  console.log('send', {paths})

  const dcp = new Dcp()
  await dcp.connect()
  await dcp.upload(paths)
  console.log('Done. Copy files on another machine with:\n')
  console.log(`dcp ${dcp.dat.key.toString('hex')}\n`)
}
