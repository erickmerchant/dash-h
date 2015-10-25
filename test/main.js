var tap = require('tap')
var main = require('../code/main.js')
var Application = require('../code/application.js')

tap.test('should make applications', function (t) {
  t.ok(main([]) instanceof Application)

  t.end()
})

tap.test('should parse', function (t) {
  t.deepEqual(main.parse(), main.parse(process.argv.slice(2)))

  t.end()
})
