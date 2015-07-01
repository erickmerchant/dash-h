
const output = require('./output.js')
const asyncDone = require('async-done')
const ap = require('ap')
const chalk = require('chalk')
const pretty = require('pretty-hrtime')
const getParams = require('get-params')

module.exports = function () {
  var funcs = [].slice.call(arguments)
  var results = []

  function series (options, done) {
    var next = funcs.shift()
    var name
    var started = process.hrtime()
    var context = []
    var params

    if (next) {
      name = next.name || 'anonymous'

      params = getParams(next)

      if (params.length > 1) {
        context.push(options)
      }

      next = ap(context, next)

      output.log(chalk.magenta(name) + ' starting ... ')

      asyncDone(next, function (err, result) {
        if (err) {
          done(err)
        } else {
          output.log(chalk.magenta(name) + ' finished in ' + chalk.cyan(pretty(process.hrtime(started))))

          results.push(result)

          series(options, done)
        }
      })
    } else {
      done(null, results)
    }
  }

  return series
}
