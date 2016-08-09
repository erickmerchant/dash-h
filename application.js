const Application = require('./lib/application')
const parse = require('./lib/parse')

module.exports = function (args) {
  return new Application(args || parse(process.argv.slice(2)))
}
