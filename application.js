const Application = require('./code/application')
const parse = require('./code/parse')

module.exports = function (args) {
  return new Application(args || parse(process.argv.slice(2)))
}
