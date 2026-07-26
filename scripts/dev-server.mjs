import { spawn } from 'node:child_process'

const input = process.argv.slice(2)
const args = []

for (let index = 0; index < input.length; index += 1) {
  const argument = input[index]

  if (argument === '--host') {
    args.push('--hostname')
    if (input[index + 1]) args.push(input[++index])
    continue
  }

  if (argument === '--strictPort') continue
  args.push(argument)
}

const child = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'dev', ...args],
  { stdio: 'inherit', env: process.env },
)

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
