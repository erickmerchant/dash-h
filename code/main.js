'use strict'

const Application = require('./application-with-help.js')
const parse = require('./parse.js')
const defaultArgv = process.argv.slice(2)

function sergeant (settings, context) {
  return new Application(settings, context || parse(defaultArgv))
}

sergeant.parse = function (argv) {
  return parse(argv || defaultArgv)
}

sergeant.series = require('./series.js')

sergeant.parallel = require('./parallel.js')

module.exports = sergeant
