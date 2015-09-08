var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it
var parse = require('../code/parse.js')

describe('parse', function () {
  it('should parse', function (done) {
    var context = {
      args: ['one', 'two'],
      options: {
        x: true,
        y: true,
        z: true,
        aaa: true,
        bbb: 'ccc'
      }
    }

    assert.deepEqual(parse(['one', 'two', '-x', '-yz', '--aaa', '--bbb=ccc']), context)

    done()
  })
})
