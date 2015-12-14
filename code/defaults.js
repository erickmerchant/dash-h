const chalk = require('chalk')

module.exports = {
  log: function (s) {
    console.log(s)
  },
  error: function (s) {
    console.error(chalk.red(s))
  },
  primary: function (s) {
    return chalk.magenta(s)
  },
  secondary: function (s) {
    return chalk.cyan(s)
  }
}
