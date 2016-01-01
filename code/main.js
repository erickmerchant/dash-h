const Application = require('./application')
const parse = require('./parse')

module.exports = function (args) {
  return new Application(args || parse(process.argv.slice(2)))
}
