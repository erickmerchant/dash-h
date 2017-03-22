const chalk = require('chalk')
const process = require('./globals').process
const console = require('./globals').console
const Error = require('./globals').Error

module.exports = function (error) {
  process.exitCode = 1

  if (typeof error === 'object' && error instanceof Error) {
    if (error.stack != null) {
      const stack = error.stack.split('\n')

      console.error(chalk.red(stack.shift()))

      stack.map((line) => line.match(/^(.*?)(\(.*\))?$/)).forEach((parts) => {
        console.error(chalk.gray(parts[1]) + (parts[2] != null ? parts[2] : ''))
      })
    } else {
      console.error(chalk.red(error.message))
    }
  }
}
