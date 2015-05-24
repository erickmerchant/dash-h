var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it
var sergeant = require('./index.js')
var chalk = require('chalk')

describe('module', function () {
  it('should run commands', function (done) {
    var app = sergeant('a test app', { args: ['test'], options: {} }, function (err, result) {
      assert.ifError(err)

      assert.equal(result, 'ran test')

      done()
    })

    app.command('test', '', {}, function (d) {
      d(null, 'ran test')
    })
  })

  it('accept arguments', function (done) {
    var app = sergeant('a test app', { args: ['test', 'testing arguments'], options: {} }, function (err) {
      assert.ifError(err)

      done()
    })

    app.command('test <arg>', '', {}, function (d) {
      assert.equal(this.arg, 'testing arguments')

      d()
    })
  })

  it('accept options', function (done) {
    var app = sergeant('a test app', { args: ['test'], options: { one: 'testing' } }, function (err) {
      assert.ifError(err)

      done()
    })

    app.command('test', '', {}, function (d) {
      assert.equal(this.options.one, 'testing')

      d()
    })
  })

  it('throws an error when command is not selected', function (done) {
    var app = sergeant('a test app', {}, function (err) {
      assert.equal(err.message, 'run with --help to get a list of commands')

      done()
    })

    app.end()
  })

  it('throws an error when command is not selected', function (done) {
    var app = sergeant('a test app', { args: ['not-defined'] }, function (err) {
      assert.equal(err.message, 'not-defined not found')

      done()
    })

    app.end()
  })

  it('provides help for the whole app', function (done) {
    var app = sergeant('a test app', { options: { help: true} }, function (err, result) {
      assert.ifError(err)

      assert.deepEqual(result, [
        chalk.magenta('Usage:') + ' [options] <command>',
        'a test app',
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('test <arg>') + '  test command'
      ].join('\n'))

      done()
    })

    app.command('test <arg>', 'test command', {'--option': 'an option'}, function () { })

    app.end()
  })

  it('provides help for each command', function (done) {
    var app = sergeant('a test app', { args: ['test'], options: { help: true } }, function (err, result) {
      assert.ifError(err)

      assert.deepEqual(result, [
        chalk.magenta('Usage:') + ' [options] test <arg>',
        'test command',
        chalk.magenta('Options:'),
        ' ' + chalk.cyan('--option') + '  an option'
      ].join('\n'))

      done()
    })

    app.command('test <arg>', 'test command', {'--option': 'an option'}, function (d) {
      d()
    })

    app.end()
  })

  it('gathers errors from commands', function (done) {
    var app = sergeant('a test app', { args: ['test'] }, function (err) {
      assert.equal(err.message, 'nothing bad happened')

      done()
    })

    app.command('test <arg>', 'test command', {'--option': 'an option'}, function (d) {
      d(new Error('nothing bad happened'))
    })
  })
})

describe('module.parse', function () {
  it('should parse', function (done) {
    var argv = {
      args: ['one', 'two'],
      options: {
        a: true,
        b: false,
        c: 'ccc',
        'no-d': 'ddd'
      }
    }

    assert.deepEqual(sergeant.parse(['one', 'two', '--a', '--no-b', '--c=ccc', '--no-d=ddd']), argv)

    done()
  })
})
