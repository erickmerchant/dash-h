var test = require('tape')

var HelpError = require('../code/help-error')

test('should return an instanceof Application', function (t) {
  var error = new HelpError('test')

  t.ok(error instanceof HelpError)

  t.ok(error instanceof Error)

  t.equals(error.message, 'test')

  t.end()
})
