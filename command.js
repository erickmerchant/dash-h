const Command = require('./lib/command')
const parse = require('./lib/parse')

module.exports = function (args) {
  return new Command(args || parse(process.argv.slice(2)))
}
