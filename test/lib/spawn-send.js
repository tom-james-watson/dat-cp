import {spawn} from 'child_process'

export default function(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      `node node_modules/babel-cli/lib/_babel-node src/dcp ${args}`,
      {shell: true}
    )

    process.on('exit', function() {
      // Child processes don't get properly cleaned up.
      // See https://github.com/nodejs/node/issues/2098.
      child.kill()
      try {
        process.kill(child.pid + 1, 'SIGINT')
      } catch (err) {
        // pass
      }
    })

    child.stdout.on('data', function(data) {
      console.log(data.toString())
      data = data.toString()

      if (data.includes('\tdcp')) {
        const parts = data.trim().split(' ')
        const key = parts[parts.length - 1]
        resolve(key)
      }
    })

    child.stderr.on('data', function(data) {
      console.error(data.toString())
    })

    child.on('close', (code) => {
      return reject(`Receive process exited with error code ${code}`)
    })
  })
}
