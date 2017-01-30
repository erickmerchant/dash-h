var test = require('tape')

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

test('.action should set a value on .act', function (t) {
  var command = new Command()

  var handler = function () {}

  command.action(handler)

  t.ok(typeof command.callAction !== 'undefined')

  t.end()
})

test('.describe should set a value on .description', function (t) {
  var command = new Command()

  var description = 'test'

  command.describe(description)

  t.equals(command.description, description)

  t.end()
})
