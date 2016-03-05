const Application = require('./application')
const Command = require('./command')
const parse = require('./parse')

function sergeant (args) {
  return new Application(args || parse(process.argv.slice(2)))
}

sergeant.command = function (args) {
  return new Command(args || parse(process.argv.slice(2)))
}

module.exports = sergeant
