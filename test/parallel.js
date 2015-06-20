var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it
var parallel = require('../code/parallel.js')

describe('parallel', function () {
  it('it should run functions in a parallel', function (done) {
    var order = []

    parallel(function (done) {
      setTimeout(function () {
        order.push(1)

        done(null, 1)
      }, 3)
    },
    function (options, done) {
      setTimeout(function () {
        order.push(2)

        done(null, 2)
      }, 2)
    },
    function (options, done) {
      setTimeout(function () {
        order.push(3)

        done(null, 3)
      }, 1)
    })({}, function (err, results) {
      assert.ifError(err)

      assert.deepEqual(order, [3, 2, 1])

      assert.deepEqual(results, [1, 2, 3])

      done()
    })
  })

  it('it should handle errors', function (done) {
    parallel(function (done) {
      done(new Error('an error'))
    },
    function (options, done) {
      done(null, 2)
    },
    function (options, done) {
      done(null, 3)
    })({}, function (err) {
      assert.equal(err.message, 'an error')

      done()
    })
  })
})
