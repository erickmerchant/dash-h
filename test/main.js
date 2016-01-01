var tap = require('tap')

var main = require('../code/main.js')
var Application = require('../code/application.js')

tap.test('should return an instanceof Application', function (t) {
  var app

  app = main()

  t.ok(app instanceof Application)

  app = main(new Map([]))

  t.ok(app instanceof Application)

  t.end()
})
