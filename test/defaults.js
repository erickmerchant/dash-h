var log = []
var errors = []

console.log = function (msg) {
  log.push(msg)
}

console.error = function (err) {
  errors.push(err)
}

var tap = require('tap')
var chalk = require('chalk')
var defaults = require('../code/defaults.js')
var methods = Object.keys(defaults)

tap.test('defaults should be what we expect', function (t) {
  t.ok(methods.indexOf('log') > -1)

  defaults.log('test 1 2 3')

  t.deepEquals(log, ['test 1 2 3'])

  t.ok(methods.indexOf('error') > -1)

  defaults.error(new Error('test 1 2 3'))

  t.deepEqual(errors, [chalk.red('Error: test 1 2 3')])

  t.ok(methods.indexOf('primary') > -1)

  t.equals(defaults.primary('test 1 2 3'), chalk.magenta('test 1 2 3'))

  t.ok(methods.indexOf('secondary') > -1)

  t.equals(defaults.secondary('test 1 2 3'), chalk.cyan('test 1 2 3'))

  t.end()
})
