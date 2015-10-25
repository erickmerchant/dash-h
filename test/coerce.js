var coerce = require('../code/coerce.js')
var tap = require('tap')

tap.test('should return "true" as true', function (t) {
  t.equal(coerce('true'), true)

  t.end()
})

tap.test('should return "\'true\'" as \'true\'', function (t) {
  t.equal(coerce("'true'"), 'true')

  t.end()
})

tap.test('should return \'"true"\' as \'true\'', function (t) {
  t.equal(coerce('"true"'), 'true')

  t.end()
})

tap.test('should return "false" as false', function (t) {
  t.equal(coerce('false'), false)

  t.end()
})

tap.test('should return "null" as null', function (t) {
  t.equal(coerce('null'), null)

  t.end()
})

tap.test('should return numbers (ints)', function (t) {
  t.equal(coerce('1'), 1)

  t.end()
})

tap.test('should return numbers (doubles)', function (t) {
  t.equal(coerce('1.1'), 1.1)

  t.end()
})

tap.test('should return numbers (hexadecimal)', function (t) {
  t.equal(coerce('0xf'), 15)

  t.end()
})

tap.test('should return numbers (binary)', function (t) {
  t.equal(coerce('0b11'), 3)

  t.end()
})
