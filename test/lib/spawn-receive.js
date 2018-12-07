import {spawn} from 'child_process'

export default function(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      `mkdir -p test/tmp && cd test/tmp && ../../node_modules/.bin/babel-node ../../src/dcp.js ${args}`,
      {shell: true}
    )

    child.stdout.on('data', function(data) {
      console.log(data.toString())
    })

    child.stderr.on('data', function(data) {
      console.error(data.toString())
    })

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(`Receive process exited with error code ${code}`)
      }
      resolve()
    })
  })
}
