const asyncDone = require('async-done')
const ap = require('ap')
const chalk = require('chalk')
const pretty = require('pretty-hrtime')
const getParams = require('get-params')
const output = require('./output.js')

module.exports = function () {
  var funcs = [].slice.call(arguments)
  var results = []
  var incomplete = funcs.length

  return function parallel (options, done) {
    funcs.forEach(function (func, k) {
      var name = func.name || 'anonymous'
      var started = process.hrtime()
      var context = []
      var params = getParams(func)

      if (params.length > 1) {
        context.push(options)
      }

      func = ap(context, func)

      output.log(chalk.magenta(name) + ' starting ... ')

      asyncDone(func, function (err, result) {
        if (err) {
          done(err)
        } else {
          output.log(chalk.magenta(name) + ' finished in ' + chalk.cyan(pretty(process.hrtime(started))))

          results[k] = result

          if (!--incomplete) {
            done(null, results)
          }
        }
      })
    })
  }
}
