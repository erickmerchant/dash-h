var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it
var dash = require('./index.js')
var chalk = require('chalk')
var rewire = require('rewire')

describe('module', function () {
  it('should run commands', function (done) {
    var app = dash('a test app', ['test'])

    app.command('test', '', {}, function (d) {
      assert.ok(true)

      d()
    })

    app.run(done)
  })

  it('accept arguments', function (done) {
    var app = dash('a test app', ['test', '"testing arguments"'])

    app.command('test <arg>', '', {}, function (d) {
      assert.equal(this.arg, 'testing arguments')

      d()
    })

    app.run(done)
  })

  it('accept options', function (done) {
    var app = dash('a test app', ['test', '--one="testing"'])

    app.command('test', '', {}, function (d) {
      assert.equal(this.options.one, 'testing')

      d()
    })

    app.run(done)
  })

  it('accept true options', function (done) {
    var app = dash('a test app', ['test', '--one'])

    app.command('test', '', {}, function (d) {
      assert.equal(this.options.one, true)

      d()
    })

    app.run(done)
  })

  it('accept false options', function (done) {
    var app = dash('a test app', ['test', '--no-one'])

    app.command('test', '', {}, function (d) {
      assert.equal(this.options.one, false)

      d()
    })

    app.run(done)
  })

  it('throws an error when command is not selected', function (done) {
    var app = dash('a test app', [])
    var errors = []
    var origError = console.error

    app.command('test', '', {}, function (d) {
      d()
    })

    console.error = function (x) {
      errors.push(x)
    }

    app.run(function (err) {
      assert.equal(err.message, 'run with --help to get a list of commands')

      assert.deepEqual(errors, [chalk.red('Error: run with --help to get a list of commands')])

      done()
    })

    console.error = origError
  })

  it('throws an error when command is not selected', function (done) {
    var app = dash('a test app', ['not-defined'])
    var errors = []
    var origError = console.error

    app.command('test', '', {}, function (d) {
      d()
    })

    console.error = function (x) {
      errors.push(x)
    }

    app.run(function (err) {
      assert.equal(err.message, 'not-defined not found')

      assert.deepEqual(errors, [chalk.red('Error: not-defined not found')])

      done()
    })

    console.error = origError
  })

  it('throws an error when you set a value to a negated option', function (done) {
    var app = dash('a test app', ['--no-key=value'])
    var errors = []
    var origError = console.error

    app.command('test', '', {}, function (d) {
      d()
    })

    console.error = function (x) {
      errors.push(x)
    }

    app.run(function (err) {
      assert.equal(err.message, 'negated options don\'t take values')

      assert.deepEqual(errors, [chalk.red('Error: negated options don\'t take values')])

      done()
    })

    console.error = origError
  })

  it('provides help for the whole app', function (done) {
    var dash = rewire('./index.js')
    var lines = []

    dash.__set__({
      console: {
        log: function (x) {
          lines.push(x)
        },
        error: function (err) {
          throw err
        }
      }
    })

    var app = dash('a test app', ['--help'])

    app.command('test <arg>', 'test command', {'--option': 'an option'}, function (d) {
      d()
    })

    app.run(function () {
      assert.deepEqual(lines, [
        chalk.magenta('Usage:') + ' [options] <command>',
        'a test app',
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('test <arg>') + '  test command'
      ])

      done()
    })
  })

  it('provides help for each command', function (done) {
    var dash = rewire('./index.js')
    var lines = []

    dash.__set__({
      console: {
        log: function (x) {
          lines.push(x)
        },
        error: function () {
          console.error.apply(undefined, [].slice.call(arguments, 0))
        }
      }
    })

    var app = dash('a test app', ['test', '--help'])

    app.command('test <arg>', 'test command', {'--option': 'an option'}, function (d) {
      d()
    })

    app.run(function () {
      assert.deepEqual(lines, [
        chalk.magenta('Usage:') + ' [options] test <arg>',
        'test command',
        chalk.magenta('Options:'),
        ' ' + chalk.cyan('--option') + '  an option'
      ])

      done()
    })
  })

  it('console.errors errors from commands', function (done) {
    var dash = rewire('./index.js')
    var errs = []

    dash.__set__({
      console: {
        error: function (x) {
          errs.push(x)
        },
        log: function () {
          console.log.apply(undefined, [].slice.call(arguments, 0))
        }
      }
    })

    var app = dash('a test app', ['test'])

    app.command('test <arg>', 'test command', {'--option': 'an option'}, function (d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.equal(err.message, 'nothing bad happened')

      assert.deepEqual(errs, [
        chalk.red('Error: nothing bad happened')
      ])

      done()
    })
  })
})
