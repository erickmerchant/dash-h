var tap = require('tap')
var mockery = require('mockery')
var chalk = require('chalk')

tap.test('help should provide help for the application', function (t) {
  var errors = []

  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  })

  mockery.registerMock('./log', {
    error: function (err) {
      errors.push(err)
    }
  })

  var Application = require('../code/application-with-help.js')
  var app = new Application(new Map([[0, 'help']]))

  t.plan(1)

  app.run().then(function () {
    t.deepEquals(errors, ['Commands:\n  help  <command> \n'])
  })

  mockery.disable()
})

tap.test('help should provide help for the application with description and args', function (t) {
  var errors = []

  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  })

  mockery.registerMock('./log', {
    error: function (err) {
      errors.push(err)
    }
  })

  var Application = require('../code/application-with-help.js')
  var app = new Application(new Map([[0, 'help']]))

  app.describe('Test application')

  app.command('test').describe('This is the description')
  .option('xxx', 'Option xxx')
  .parameter('yyy', 'Parameter yyy')

  t.plan(1)

  app.run().then(function () {
    t.deepEquals(errors, ['Description: Test application\n\nCommands:\n  help  <command> \n  test  [--xxx] <yyy> \n'])
  })

  mockery.disable()
})

tap.test('help should provide help for a command', function (t) {
  var errors = []

  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  })

  mockery.registerMock('./log', {
    error: function (err) {
      errors.push(err)
    }
  })

  t.plan(1)

  var Application = require('../code/application-with-help.js')
  var app = new Application(new Map([[0, 'help'], [1, 'test']]))

  app.command('test')

  app.run().then(function () {
    t.deepEquals(errors, [chalk.red('Usage: test')])
  })

  mockery.disable()
})

tap.test('help should provide help for a command with description and args', function (t) {
  var errors = []

  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  })

  mockery.registerMock('./log', {
    error: function (err) {
      errors.push(err)
    }
  })

  t.plan(1)

  var Application = require('../code/application-with-help.js')
  var app = new Application(new Map([[0, 'help'], [1, 'test']]))

  app.command('test').describe('This is the description')
  .option('xxx', 'Option xxx')
  .parameter('yyy', 'Parameter yyy')

  app.run().then(function () {
    t.deepEquals(errors, ['Description: This is the description\n\nUsage: test [--xxx] <yyy>\n\nParameters:\n  yyy  Parameter yyy\n\nOptions:\n  --xxx  Option xxx\n'])
  })

  mockery.disable()
})
