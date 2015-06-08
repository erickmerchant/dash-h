'use strict'

const Application = require('./application.js')
const parse = require('./parse.js')
const defaultArgv = process.argv.slice(2)

function sergeant (settings, context) {
  return new Application(settings, context || parse(defaultArgv))
}

sergeant.parse = function (argv) {
  return parse(argv || defaultArgv)
}

module.exports = sergeant
