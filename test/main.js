var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it
var main = require('../code/main.js')
var Application = require('../code/application.js')

describe('main', function () {
  it('should make applications', function (done) {
    assert.ok(main([]) instanceof Application)

    done()
  })

  it('should parse', function (done) {
    assert.deepEqual(main.parse(), main.parse(process.argv.slice(2)))

    done()
  })
})
