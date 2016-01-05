const Application = require('./application-with-help')
const HelpError = require('./help-error')
const parse = require('./parse')
const handlers = require('./handlers')

function main (args) {
  return new Application(args || parse(process.argv.slice(2)))
}

main.error = function (message) {
  return new HelpError(message)
}

main.handlers = handlers

module.exports = main
