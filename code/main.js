'use strict'

const Application = require('./application.js')
const parse = require('./parse.js')
const defaultArgv = process.argv.slice(2)

function sergeant (argv) {
  return new Application(parse(argv || defaultArgv))
}

sergeant.parse = function (argv) {
  return parse(argv || defaultArgv)
}

module.exports = sergeant
