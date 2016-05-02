const Command = require('./code/command')
const parse = require('./code/parse')

module.exports = function (args) {
  return new Command(args || parse(process.argv.slice(2)))
}
