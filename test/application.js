var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it
var beforeEach = require('mocha').beforeEach
var Application = require('../code/application.js')
var output = require('../code/output.js')
var chalk = require('chalk')
var log
var errorLog

output.log = function (str) {
  log.push(str)
}

output.error = function (str) {
  errorLog.push(str)
}

beforeEach(function () {
  log = []
  errorLog = []
})

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

  it('throws an error when command is not selected', function (done) {
    var app = new Application({description: 'a test app'}, [{}])

    app.run(function (err) {
      assert.equal(err.message, 'run with --help to get a list of commands')

      done()
    })
  })

  it('throws an error when command is not defined', function (done) {
    var app = new Application({description: 'a test app'}, ['not-defined', {}])

    app.run(function (err) {
      assert.equal(err.message, 'not-defined not found')

      done()
    })
  })

  it('provides help for the whole app (description, commands)', function (done) {
    var app = new Application({description: 'a test app'}, [{ help: true }])

    app.command('test-2', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) { })

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) { })

    app.run(function (err) {
      assert.ifError(err)

      assert.deepEqual(log, [
        chalk.magenta('Description:') + ' a test app',
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('[options] test-2 <arg>') + '  test command',
        ' ' + chalk.cyan('[options] test <arg>') + '    test command'
      ])

      done()
    })
  })

  it('provides help for the whole app (help command)', function (done) {
    var app = new Application({description: 'a test app'}, ['help', {}])

    app.command('test-2', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) { })

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) { })

    app.run(function (err) {
      assert.ifError(err)

      assert.deepEqual(log, [
        chalk.magenta('Description:') + ' a test app',
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('[options] test-2 <arg>') + '  test command',
        ' ' + chalk.cyan('[options] test <arg>') + '    test command'
      ])

      done()
    })
  })

  it('provides help for the whole app (description)', function (done) {
    var app = new Application({description: 'a test app'}, [{ help: true }])

    app.run(function (err) {
      assert.ifError(err)

      assert.deepEqual(log, [
        chalk.magenta('Description:') + ' a test app'
      ])

      done()
    })
  })

  it('provides help for each command (description, usage, options, aliases)', function (done) {
    var app = new Application({description: 'a test app'}, ['test', { help: true } ])

    app.command('test', {
      description: 'test command',
      options: {
        '--option': 'an option',
        '--opt2': 'an option'
      },
      aliases: {
        'bb': {
          option: 'a val'
        },
        'b': {
          option: true
        }
      }
    }, function (arg, options, d) { })

    app.run(function (err) {
      assert.ifError(err)

      assert.deepEqual(log, [
        chalk.magenta('Description:') + ' test command',
        chalk.magenta('Usage:') + ' [options] test <arg>',
        chalk.magenta('Options:'),
        ' ' + chalk.cyan('--option') + '  an option',
        ' ' + chalk.cyan('--opt2') + '    an option',
        chalk.magenta('Aliases:'),
        ' ' + chalk.cyan('bb') + '  --option="a val"',
        ' ' + chalk.cyan('b') + '   --option'
      ])

      done()
    })
  })

  it('provides help for each command (description, usage)', function (done) {
    var app = new Application({description: 'a test app'}, ['test', { help: true } ])

    app.command('test', {
      description: 'test command'
    }, function (arg, options, d) { })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.deepEqual(log, [
        chalk.magenta('Description:') + ' test command',
        chalk.magenta('Usage:') + ' [options] test <arg>'
      ])

      done()
    })
  })

  it('errors with too many arguments', function (done) {
    var app = new Application({description: 'a test app'}, ['test', '1', '2', {}])

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.equal(err.message, 'too many arguments for test')

      done()
    })
  })

  it('errors with too few arguments (singular)', function (done) {
    var app = new Application({description: 'a test app'}, ['test', '1', {}])

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg1, arg2, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.equal(err.message, 'missing argument (arg2) for test')

      done()
    })
  })

  it('errors with too few arguments (plural)', function (done) {
    var app = new Application({description: 'a test app'}, ['test', {}])

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg1, arg2, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.equal(err.message, 'missing arguments (arg1, arg2) for test')

      done()
    })
  })

  it('gathers errors from commands', function (done) {
    var app = new Application({description: 'a test app'}, ['test', 'testing', {}])

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.equal(err.message, 'nothing bad happened')

      done()
    })
  })
})
