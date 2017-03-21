const chalk = require('chalk')
const process = require('./globals').process
const console = require('./globals').console
const Error = require('./globals').Error

module.exports = function (error) {
  process.exitCode = 1

  if (typeof error === 'object' && error instanceof Error) {
    console.error(chalk.red(error.message))

    if (error.stack != null) {
      error.stack.split('\n').map((line) => line.match(/^(.*?)(\(.*\))?$/)).forEach((parts) => {
        console.error(parts[1] + (parts[2] != null ? chalk.gray(parts[2]) : ''))
      })
    }
  }
}
