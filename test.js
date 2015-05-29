var assert = require('assert')
var describe = require('mocha').describe
var it = require('mocha').it
var sergeant = require('./index.js')
var chalk = require('chalk')

describe('module', function () {
  it('should run commands', function (done) {
    var app = sergeant('a test app', ['test', {}])

    app.command('test', function (options, d) {
      d(null, 'ran test')
    })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.equal(result, 'ran test')

      done()
    })
  })

  it('should run commands that only take a callback', function (done) {
    var app = sergeant('a test app', ['test', {}])

    app.command('test', function (d) {
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
    var app = sergeant('a test app', ['test', { one: 'testing' }])

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
    var app = sergeant('a test app', ['test', { a: true }])

    app.command('test', { aliases: { a: { b: 'bb', c: 'cc' }}}, function (options, d) {
      assert.equal(options.a, undefined)

      assert.equal(options.b, 'bb')

      assert.equal(options.c, 'cc')

      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('accept aliases', function (done) {
    var app = sergeant('a test app', ['test', { a: true }])

    app.command('test', { aliases: { x: { b: 'bb', c: 'cc' }}}, function (options, d) {
      assert.equal(options.a, true)

      assert.equal(options.b, undefined)

      assert.equal(options.c, undefined)

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

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) { })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.deepEqual(result, [
        'a test app',
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('[options] test <arg>') + '  test command'
      ].join('\n'))

      done()
    })
  })

  it('provides help for the whole app', function (done) {
    var app = sergeant('a test app', [{ help: true }])

    app.command('test-2', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) { })

    app.command('test', {
      description: 'test command',
      options: {'--option': 'an option'}
    }, function (arg, options, d) { })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.deepEqual(result, [
        'a test app',
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('[options] test-2 <arg>') + '  test command',
        ' ' + chalk.cyan('[options] test <arg>') + '    test command'
      ].join('\n'))

      done()
    })
  })

  it('provides help for the whole app', function (done) {
    var app = sergeant('a test app', [{ help: true }])

    app.run(function (err, result) {
      assert.ifError(err)

      assert.deepEqual(result, [
        'a test app'
      ].join('\n'))

      done()
    })
  })

  it('provides help for each command', function (done) {
    var app = sergeant('a test app', ['test', { help: true } ])

    app.command('test', {
      description: 'test command',
      options: {
        '--option': 'an option',
        '--opt2': 'an option'
      }
    }, function (arg, options, d) { })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.deepEqual(result, [
        chalk.magenta('Usage:') + ' [options] test <arg>',
        'test command',
        chalk.magenta('Options:'),
        ' ' + chalk.cyan('--option') + '  an option',
        ' ' + chalk.cyan('--opt2') + '    an option'
      ].join('\n'))

      done()
    })
  })

  it('provides help for each command', function (done) {
    var app = sergeant('a test app', ['test', { help: true } ])

    app.command('test', {
      description: 'test command'
    }, function (arg, options, d) { })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.deepEqual(result, [
        chalk.magenta('Usage:') + ' [options] test <arg>',
        'test command'
      ].join('\n'))

      done()
    })
  })

  it('errors with too many arguments', function (done) {
    var app = sergeant('a test app', ['test', '1', '2', {}])

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

  it('errors with too few arguments', function (done) {
    var app = sergeant('a test app', ['test', '1', {}])

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

  it('errors with too few arguments', function (done) {
    var app = sergeant('a test app', ['test', {}])

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
    var app = sergeant('a test app', ['test', 'testing', {}])

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

describe('module.parse', function () {
  it('should parse', function (done) {
    var context = ['one', 'two', {
        x: true,
        y: true,
        z: true,
        aaa: true,
        bbb: 'ccc'
      }
    ]

    assert.deepEqual(sergeant.parse(['one', 'two', '-x', '-yz', '--aaa', '--bbb=ccc']), context)

    done()
  })
})
