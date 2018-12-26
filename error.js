const kleur = require('kleur')
const { process, console } = require('./src/globals')

module.exports = (error) => {
  process.exitCode = 1

  if (typeof error === 'object' && error instanceof Error) {
    if (error.stack != null) {
      const stack = error.stack.split('\n')

      console.error(kleur.red(stack.shift()))

      for (const line of stack) {
        console.error(line)
      }
    } else {
      console.error(kleur.red(error.toString()))
    }
  }
}
