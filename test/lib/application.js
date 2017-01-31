var test = require('tape')
var mockery = require('mockery')
var Command = require('../../lib/command')
var chalk = require('chalk')

test('.command should return a new Command', function (t) {
  var Application = require('../../lib/application')
  var app = new Application(new Map([]))

  var command = app.command('test')

  t.ok(command instanceof Command)

  t.end()
})

test('.describe should set a value on .description', function (t) {
  var Application = require('../../lib/application')
  var app = new Application(new Map([]))

  var description = 'test'

  app.describe(description)

  t.equals(app.description, description)

  t.end()
})

test('.run should return a new Promise', function (t) {
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

  var Application = require('../../lib/application')
  var app = new Application(new Map([]))

  t.plan(2)

  var ran = app.run().then(function () {
    t.deepEquals(errors, ['Command not found. Run `help` for a list of commands.'])
  })

  t.ok(ran instanceof Promise)

  mockery.disable()
})

test('.run should throw a HelpError if no command is selected', function (t) {
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

  var Application = require('../../lib/application')
  var app = new Application(new Map([]))

  t.plan(1)

  app.run().then(function () {
    t.deepEquals(errors, ['Command not found. Run `help` for a list of commands.'])
  })

  mockery.disable()
})

test('.run should run commands that return a value', function (t) {
  var Application = require('../../lib/application')
  var app = new Application(new Map([[0, 'test']]))

  t.plan(1)

  app.command('test').action(function () {
    return '1 2 3'
  })

  app.run().then(function (result) {
    t.equals(result, '1 2 3')
  })
})

test('.run should run commands that return a promise', function (t) {
  var Application = require('../../lib/application')
  var app = new Application(new Map([[0, 'test']]))

  t.plan(1)

  app.command('test').action(function () {
    return Promise.resolve('1 2 3')
  })

  app.run().then(function (result) {
    t.equals(result, '1 2 3')
  })
})

test('.run should pass args', function (t) {
  var Application = require('../../lib/application')
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

test('help should throw an error if passed a non-existent command', function (t) {
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

  var Application = require('../../lib/application')
  var app = new Application(new Map([[0, 'help'], [1, 'test']]))

  t.plan(1)

  app.run().then(function () {
    t.deepEquals(errors, ['Command not found. Run `help` for a list of commands.'])
  })

  mockery.disable()
})

test('help should provide help for the application', function (t) {
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

  var Application = require('../../lib/application')
  var app = new Application(new Map([[0, 'help']]))

  t.plan(1)

  app.run().then(function () {
    t.deepEquals(errors, ['Commands:\n  help  [--help] <command> \n'])
  })

  mockery.disable()
})

test('help should provide help for the application with description and args', function (t) {
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

  var Application = require('../../lib/application')
  var app = new Application(new Map([[0, 'help']]))

  app.describe('Test application')

  app.command('test').describe('This is the description')
  .option('x', 'Option xxx')
  .option('xxx', 'Option xxx')
  .parameter('yyy', 'Parameter yyy')

  t.plan(1)

  app.run().then(function () {
    t.deepEquals(errors, ['Description: Test application\n\nCommands:\n  help  [--help] <command> \n  test  [--help] [-x] [--xxx] <yyy> \n'])
  })

  mockery.disable()
})

test('help should provide help for a command', function (t) {
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

  var Application = require('../../lib/application')
  var app = new Application(new Map([[0, 'help'], [1, 'test']]))

  app.command('test')

  app.run().then(function () {
    t.deepEquals(errors, [chalk.red('Usage: test [--help]\n\nOptions:\n --help,-h display this message\n')])
  })

  mockery.disable()
})

test('help should provide help for a command with description and args', function (t) {
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

  var Application = require('../../lib/application')
  var app = new Application(new Map([[0, 'help'], [1, 'test']]))

  app.command('test').describe('This is the description')
  .option('x', 'Option xxx')
  .option('xxx', 'Option xxx')
  .parameter('yyy', 'Parameter yyy')

  app.run().then(function () {
    t.deepEquals(errors, ['Description: This is the description\n\nUsage: test [--help] [-x] [--xxx] <yyy>\n\nParameters:\n yyy Parameter yyy\n\nOptions:\n --help,-h display this message\n -x Option xxx\n --xxx Option xxx\n'])
  })

  mockery.disable()
})
