var tap = require('tap')
var mockery = require('mockery')
var Command = require('../code/command')
var chalk = require('chalk')

tap.test('.command should return a new Command', function (t) {
  var Application = require('../code/application')
  var app = new Application(new Map([]))

  var command = app.command('test')

  t.ok(command instanceof Command)

  t.end()
})

tap.test('.describe should set a value on .description', function (t) {
  var Application = require('../code/application')
  var app = new Application(new Map([]))

  var description = 'test'

  app.describe(description)

  t.equals(app.description, description)

  t.end()
})

tap.test('.run should return a new Promise', function (t) {
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

  var Application = require('../code/application')
  var app = new Application(new Map([]))
  var HelpError = require('../code/help-error')

  t.plan(3)

  var ran = app.run().catch(function (err) {
    t.deepEquals(errors, ['run `help` for a list of commands'])

    t.ok(err instanceof HelpError)
  })

  t.ok(ran instanceof Promise)

  mockery.disable()
})

tap.test('.run should throw a HelpError if no command is selected', function (t) {
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

  var Application = require('../code/application')
  var app = new Application(new Map([]))
  var HelpError = require('../code/help-error')

  t.plan(2)

  app.run().catch(function (err) {
    t.deepEquals(errors, ['run `help` for a list of commands'])

    t.ok(err instanceof HelpError)
  })

  mockery.disable()
})

tap.test('.run should run commands that return a value', function (t) {
  var Application = require('../code/application')
  var app = new Application(new Map([[0, 'test']]))

  t.plan(1)

  app.command('test').action(function () {
    return '1 2 3'
  })

  app.run().then(function (result) {
    t.equals(result, '1 2 3')
  })
})

tap.test('.run should run commands that return a promise', function (t) {
  var Application = require('../code/application')
  var app = new Application(new Map([[0, 'test']]))

  t.plan(1)

  app.command('test').action(function () {
    return Promise.resolve('1 2 3')
  })

  app.run().then(function (result) {
    t.equals(result, '1 2 3')
  })
})

tap.test('.run should pass args', function (t) {
  var Application = require('../code/application')
  var app = new Application(new Map([[0, 'test'], ['x', 'a'], [1, 'b']]))

  t.plan(1)

  app.command('test')
  .option('x')
  .option('y')
  .parameter('z')
  .action(function (args) {
    t.deepEquals(Array.from(args), [['x', 'a'], ['z', 'b']])
  })

  app.run()
})

tap.test('help should throw an error if passed a non-existent command', function (t) {
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

  var Application = require('../code/application')
  var app = new Application(new Map([[0, 'help'], [1, 'test']]))
  var HelpError = require('../code/help-error')

  t.plan(2)

  app.run().catch(function (err) {
    t.deepEquals(errors, ['run `help` for a list of commands'])

    t.ok(err instanceof HelpError)
  })

  mockery.disable()
})

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

  var Application = require('../code/application')
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

  var Application = require('../code/application')
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

  var Application = require('../code/application')
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

  var Application = require('../code/application')
  var app = new Application(new Map([[0, 'help'], [1, 'test']]))

  app.command('test').describe('This is the description')
  .option('xxx', 'Option xxx')
  .parameter('yyy', 'Parameter yyy')

  app.run().then(function () {
    t.deepEquals(errors, ['Description: This is the description\n\nUsage: test [--xxx] <yyy>\n\nParameters:\n    yyy  Parameter yyy\n\nOptions:\n  --xxx  Option xxx\n'])
  })

  mockery.disable()
})
