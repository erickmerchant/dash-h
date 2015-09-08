var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it
var coerce = require('../code/coerce.js')

describe('coerce', function () {
  it('should return "true" as true', function (done) {
    assert.equal(coerce('true'), true)

    done()
  })

  it('should return "\'true\'" as \'true\'', function (done) {
    assert.equal(coerce("'true'"), 'true')

    done()
  })

  it('should return \'"true"\' as \'true\'', function (done) {
    assert.equal(coerce('"true"'), 'true')

    done()
  })

  it('should return "false" as false', function (done) {
    assert.equal(coerce('false'), false)

    done()
  })

  it('should return "null" as null', function (done) {
    assert.equal(coerce('null'), null)

    done()
  })

  it('should return numbers (ints)', function (done) {
    assert.equal(coerce('1'), 1)

    done()
  })

  it('should return numbers (doubles)', function (done) {
    assert.equal(coerce('1.1'), 1.1)

    done()
  })

  it('should return numbers (hexadecimal)', function (done) {
    assert.equal(coerce('0xf'), 15)

    done()
  })

  it('should return numbers (binary)', function (done) {
    assert.equal(coerce('0b11'), 3)

    done()
  })
})
