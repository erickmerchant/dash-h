var test = require('tape')
var mockery = require('mockery')

var Command = require('../../lib/command')

test('.arg should set a value on .args', function (t) {
  var command = new Command()

  command.option('test', null)

  t.ok(command.optionsParameters.has('test'))

  t.deepEquals(command.optionsParameters.get('test'), {
    aliases: [],
    key: 'test',
    description: ''
  })

  t.end()
})

test('.action should set a value on .callback', function (t) {
  var command = new Command()

  var handler = function () {}

  command.action(handler)

  t.ok(typeof command.callback !== 'undefined')

  t.end()
})

test('.describe should set a value on .description', function (t) {
  var command = new Command()

  var description = 'test'

  command.describe(description)

  t.equals(command.description, description)

  t.end()
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

  var Command = require('../../lib/command')
  var app = new Command(new Map([['h', true]]))

  t.plan(1)

  app.run().then(function () {
    t.deepEquals(errors, ['Usage:  [--help]\n\nOptions:\n --help,-h display this message\n'])
  })

  mockery.disable()
})

test('should pass errors through', function (t) {
  var Command = require('../../lib/command')
  var command = new Command(new Map())

  command.action(function () {
    throw new Error('testing errors')
  })

  t.plan(1)

  command.run().catch(function (err) {
    t.equals(err.message, 'testing errors')
  })
})
