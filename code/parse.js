'use strict'

const getValue = require('./get-value.js')

module.exports = function (argv) {
  var context = []
  var options = {}

  argv.forEach(function (arg) {
    var parts
    var val

    if (arg.startsWith('--')) {
      arg = arg.substr(2)

      parts = arg.split('=')

      if (parts.length === 1) {
        val = true
      } else {
        val = getValue(parts.slice(1).join('='))
      }

      options[parts[0]] = val
    } else if (arg.startsWith('-')) {
      arg.substr(1).split('').forEach(function (v) {
        options[v] = true
      })
    } else {
      val = getValue(arg)

      context.push(val)
    }
  })

  context.push(options)

  return context
}
