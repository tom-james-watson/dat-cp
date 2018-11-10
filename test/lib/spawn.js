import {spawn} from 'child_process'

export default function(args) {
  const child = spawn('npm', ['run', 'cli', '--', ...args.split(' ')])
  child.unref()
  return child
}
