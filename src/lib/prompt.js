import rl from 'readline'

export default function prompt(question) {
  return new Promise((resolve) => {
    const r = rl.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    r.question(question, function(answer) {
      r.close()
      resolve(answer)
    })

    r.on('SIGINT', () => {
      process.exit()
    })
  })
}
