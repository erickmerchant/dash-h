require('../mock/output.js')

var describe = require('mocha').describe
var assert = require('assert')
var it = require('mocha').it
var chalk = require('chalk')
var Application = require('../code/application.js')

describe('application', function () {
  it('should run commands', function (done) {
    var app = new Application({description: 'a test app'}, ['test', {}])

    app.command('test', function (options, d) {
      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('should run commands that only take a callback', function (done) {
    var app = new Application({description: 'a test app'}, ['test', {}])

    app.command('test', function (d) {
      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('accept arguments', function (done) {
    var app = new Application({description: 'a test app'}, ['test', 'testing arguments', {}])

    app.command('test', function (arg, options, d) {
      assert.equal(arg, 'testing arguments')

      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('accept options', function (done) {
    var app = new Application({description: 'a test app'}, ['test', { one: 'testing' }])

    app.command('test', function (options, d) {
      assert.equal(options.one, 'testing')

      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('accept aliases', function (done) {
    var app = new Application({description: 'a test app'}, ['test', { a: true }])

    app.command('test', { aliases: { a: { b: 'bb', c: 'cc' }, x: { y: 'yy' }}}, function (options, d) {
      assert.equal(options.a, undefined)

      assert.equal(options.b, 'bb')

      assert.equal(options.c, 'cc')

      assert.equal(options.y, undefined)

      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('throws an error when command is not defined', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({description: 'a test app'}, ['not-defined', {}])

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: not-defined not found') ])

      assert.equal(err.message, 'not-defined not found')

      done()
    })
  })

  it('errors with too many arguments', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({description: 'a test app'}, ['test', '1', '2', {}])

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: too many arguments for test') ])

      assert.equal(err.message, 'too many arguments for test')

      done()
    })
  })

  it('errors with too few arguments (singular)', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({description: 'a test app'}, ['test', '1', {}])

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg1, arg2, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: missing argument (arg2) for test') ])

      assert.equal(err.message, 'missing argument (arg2) for test')

      done()
    })
  })

  it('errors with too few arguments (plural)', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({description: 'a test app'}, ['test', {}])

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg1, arg2, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: missing arguments (arg1, arg2) for test') ])

      assert.equal(err.message, 'missing arguments (arg1, arg2) for test')

      done()
    })
  })

  it('gathers errors from commands', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({description: 'a test app'}, ['test', 'testing', {}])

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: nothing bad happened') ])

      assert.equal(err.message, 'nothing bad happened')

      done()
    })
  })
})
