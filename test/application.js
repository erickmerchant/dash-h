var tap = require('tap')
var mockery = require('mockery')
var Command = require('../code/command.js')

tap.test('.command should return a new Command', function (t) {
  var Application = require('../code/application.js')
  var app = new Application(new Map([]))

  var command = app.command('test')

  t.ok(command instanceof Command)

  t.end()
})

tap.test('.describe should set a value on .description', function (t) {
  var Application = require('../code/application.js')
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

  var Application = require('../code/application.js')
  var app = new Application(new Map([]))
  var HelpError = require('../code/help-error.js')

  t.plan(2)

  var ran = app.run().catch(function (err) {
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

  var Application = require('../code/application.js')
  var app = new Application(new Map([]))
  var HelpError = require('../code/help-error.js')

  t.plan(2)

  app.run().catch(function (err) {
    t.deepEquals(errors, ['run `help` for a list of commands'])

    t.ok(err instanceof HelpError)
  })

  mockery.disable()
})

tap.test('.run should run commands that return a value', function (t) {
  var Application = require('../code/application.js')
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
  var Application = require('../code/application.js')
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
  var Application = require('../code/application.js')
  var app = new Application(new Map([[0, 'test'], ['x', 'a'], [1, 'b']]))

  t.plan(1)

  app.command('test')
  .option('x')
  .parameter('y')
  .action(function (args) {
    t.deepEquals(Array.from(args), [['x', 'a'], ['y', 'b']])
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

  var Application = require('../code/application.js')
  var app = new Application(new Map([[0, 'help'], [1, 'test']]))
  var HelpError = require('../code/help-error.js')

  t.plan(2)

  app.run().catch(function (err) {
    t.deepEquals(errors, ['help not found'])

    t.ok(err instanceof HelpError)
  })

  mockery.disable()
})
