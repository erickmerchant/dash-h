var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it
var series = require('../code/series.js')

describe('series', function () {
  it('it should run functions in a series', function (done) {
    var order = []

    series(function (done) {
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

      assert.deepEqual(order, [1, 2, 3])

      assert.deepEqual(results, [1, 2, 3])

      done()
    })
  })

  it('it should handle errors', function (done) {
    series(function (done) {
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
