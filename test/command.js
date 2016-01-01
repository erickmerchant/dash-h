var tap = require('tap')

var Command = require('../code/command.js')

tap.test('.arg should set a value on .args', function (t) {
  var command = new Command()

  var handler = function () {}

  command.option('test', null, handler)

  t.ok(command.args.has('test'))

  t.deepEquals(command.args.get('test'), {
    key: 'test',
    description: '',
    handler: handler
  })

  t.end()
})

tap.test('.action should set a value on .act', function (t) {
  var command = new Command()

  var handler = function () {}

  command.action(handler)

  t.ok(typeof command.act !== 'undefined')

  t.end()
})

tap.test('.describe should set a value on .description', function (t) {
  var command = new Command()

  var description = 'test'

  command.describe(description)

  t.equals(command.description, description)

  t.end()
})
