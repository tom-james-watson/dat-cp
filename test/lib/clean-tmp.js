import {spawn} from 'child_process'

export default function(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('rm -rf test/tmp/*', {shell: true})

    child.on('close', (code) => {
      resolve()
    })
  })
}
