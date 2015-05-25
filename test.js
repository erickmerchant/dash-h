var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it
var sergeant = require('./index.js')
var chalk = require('chalk')

describe('module', function () {
  it('should run commands', function (done) {
    var app = sergeant('a test app', ['test', {}])

    app.command('test', '', {}, function (options, d) {
      d(null, 'ran test')
    })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.equal(result, 'ran test')

      done()
    })
  })

  it('accept arguments', function (done) {
    var app = sergeant('a test app', ['test', 'testing arguments', {}])

    app.command('test <arg>', '', {}, function (arg, options, d) {
      assert.equal(arg, 'testing arguments')

      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('accept options', function (done) {
    var app = sergeant('a test app', ['test', { one: 'testing' }])

    app.command('test', '', {}, function (options, d) {
      assert.equal(options.one, 'testing')

      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('throws an error when command is not selected', function (done) {
    var app = sergeant('a test app', [{}])

    app.run(function (err) {
      assert.equal(err.message, 'run with --help to get a list of commands')

      done()
    })
  })

  it('throws an error when command is not selected', function (done) {
    var app = sergeant('a test app', ['not-defined', {}])

    app.run(function (err) {
      assert.equal(err.message, 'not-defined not found')

      done()
    })
  })

  it('provides help for the whole app', function (done) {
    var app = sergeant('a test app', [{ help: true }])

    app.command('test <arg>', 'test command', {'--option': 'an option'}, function () { })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.deepEqual(result, [
        chalk.magenta('Usage:') + ' [options] <command>',
        'a test app',
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('test <arg>') + '  test command'
      ].join('\n'))

      done()
    })
  })

  it('provides help for each command', function (done) {
    var app = sergeant('a test app', ['test', { help: true } ])

    app.command('test <arg>', 'test command', {'--option': 'an option'}, function () { })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.deepEqual(result, [
        chalk.magenta('Usage:') + ' [options] test <arg>',
        'test command',
        chalk.magenta('Options:'),
        ' ' + chalk.cyan('--option') + '  an option'
      ].join('\n'))

      done()
    })
  })

  it('errors with the incorrect number of arguments', function (done) {
    var app = sergeant('a test app', ['test', {}])

    app.command('test <arg>', 'test command', {'--option': 'an option'}, function (arg, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.equal(err.message, 'incorrect usage of test')

      done()
    })
  })

  it('gathers errors from commands', function (done) {
    var app = sergeant('a test app', ['test', 'testing', {}])

    app.command('test <arg>', 'test command', {'--option': 'an option'}, function (arg, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.equal(err.message, 'nothing bad happened')

      done()
    })
  })
})

describe('module.parse', function () {
  it('should parse', function (done) {
    var context = ['one', 'two', {
        a: true,
        b: false,
        c: 'ccc',
        'no-d': 'ddd'
      }
    ]

    assert.deepEqual(sergeant.parse(['one', 'two', '--a', '--no-b', '--c=ccc', '--no-d=ddd']), context)

    done()
  })
})
