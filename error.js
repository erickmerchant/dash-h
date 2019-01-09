const {red} = require('kleur')
const {process, console} = require('./src/globals')

module.exports = (error) => {
  process.exitCode = 1

  if (typeof error === 'object' && error instanceof Error) {
    const lines = []

    if (error.stack != null) {
      const stack = error.stack.split('\n')

      lines.push(red(stack.shift()))

      for (const line of stack) {
        lines.push(line)
      }
    } else {
      lines.push(red(error.toString()))
    }

    console.error(lines.join('\n'))
  }
}
