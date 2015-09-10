require('../mock/output.js')

var describe = require('mocha').describe
var assert = require('assert')
var it = require('mocha').it
var chalk = require('chalk')
var Application = require('../code/application.js')

describe('application', function () {
  it('should run commands', function (done) {
    var app = new Application({args: ['test'], options: {}})

    app.command('test').action(function (options, d) {
      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('should run commands that only take a callback', function (done) {
    var app = new Application({args: ['test'], options: {}})

    app.command('test').action(function (d) {
      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('should allow promises', function (done) {
    var app = new Application({args: ['test'], options: {}})

    app.command('test').action(function () {
      return Promise.resolve()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('accept arguments', function (done) {
    var app = new Application({args: ['test', 'testing arguments'], options: {}})

    app.command('test').parameter('arg1').action(function (args, options, d) {
      assert.equal(args.arg1, 'testing arguments')

      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('accept options', function (done) {
    var app = new Application({args: ['test'], options: { one: 'testing' }})

    app.command('test').action(function (options, d) {
      assert.equal(options.one, 'testing')

      d()
    })

    app.run(function (err) {
      assert.ifError(err)

      done()
    })
  })

  it('throws an error when command is not defined', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({args: ['not-defined'], options: {}})

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: run help to get a list of commands') ])

      assert.equal(err.message, 'run help to get a list of commands')

      done()
    })
  })

  it('errors with too many arguments', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({args: ['test', '1', '2'], options: {}})

    app.command('test').action(function (args, options, d) {
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
    var app = new Application({args: ['test', '1'], options: {}})

    app.command('test').parameter('arg1').parameter('arg2').action(function (args, options, d) {
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
    var app = new Application({args: ['test'], options: {}})

    app.command('test').parameter('arg1').parameter('arg2').action(function (args, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: missing arguments (arg1, arg2) for test') ])

      assert.equal(err.message, 'missing arguments (arg1, arg2) for test')

      done()
    })
  })

  it('gathers errors from commands (thrown)', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({args: ['test'], options: {}})

    app.command('test').action(function (args, options, d) {
      throw new Error('nothing bad happened')
    })

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: nothing bad happened') ])

      assert.equal(err.message, 'nothing bad happened')

      done()
    })
  })

  it('gathers errors from commands (callback)', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({args: ['test'], options: {}})

    app.command('test').action(function (arg, options, d) {
      d(new Error('nothing bad happened'))
    })

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: nothing bad happened') ])

      assert.equal(err.message, 'nothing bad happened')

      done()
    })
  })

  it('throws an error when command is not selected', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({args: [], options: {}})

    app.describe('a test app')

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: run help to get a list of commands') ])

      assert.equal(err.message, 'run help to get a list of commands')

      done()
    })
  })

  it('provides help for the whole app (description, commands)', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({args: ['help'], options: {}})

    app.describe('a test app')

    app.command('test-2')
      .describe('test command')
      .parameter('arg1')
      .option('option', 'an option')
      .action(function (args, options, d) { })

    app.command('test')
      .describe('test command')
      .parameter('arg1')
      .option('option', 'an option')
      .action(function (args, options, d) { })

    app.run(function (err) {
      assert.ifError(err)

      assert.deepEqual(output.logs(), [
        chalk.magenta('Description:') + ' a test app',
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('[options] help ') + '          provides help for the application',
        ' ' + chalk.cyan('[options] test-2 <arg1>') + '  test command',
        ' ' + chalk.cyan('[options] test <arg1>') + '    test command'
      ])

      done()
    })
  })

  it('provides help for the whole app (description)', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({args: ['help'], options: {}})

    app.describe('a test app')

    app.run(function (err) {
      assert.ifError(err)

      assert.deepEqual(output.logs(), [
        chalk.magenta('Description:') + ' a test app',
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('[options] help ') + '  provides help for the application'
      ])

      done()
    })
  })

  it('provides help for the whole app', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({args: ['help'], options: {}})

    app.run(function (err) {
      assert.ifError(err)

      assert.deepEqual(output.logs(), [
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('[options] help ') + '  provides help for the application'
      ])

      done()
    })
  })

  it('provides help for each command (description, usage, parameters, options, aliases)', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({args: ['test'], options: {help: true}})

    app.describe('a test app')

    app.command('test')
      .describe('test command')
      .parameter('arg', 'an argument')
      .parameter('arg2', 'an argument')
      .option('o', 'an option')
      .option('opt2', 'an option')
      .alias('string-alias', { option: 'a val' })
      .alias('true-alias', { option: true })
      .alias('false-alias', { option: false })
      .alias('null-alias', { option: null })
      .alias('number-alias', { option: 123 })
      .action(function (arg, options, d) { })

    app.run(function (err) {
      assert.ifError(err)

      assert.deepEqual(output.logs(), [
        chalk.magenta('Description:') + ' test command',
        chalk.magenta('Usage:') + ' [options] test <arg> <arg2>',
        chalk.magenta('Parameters:'),
        ' ' + chalk.cyan('arg') + '   an argument',
        ' ' + chalk.cyan('arg2') + '  an argument',
        chalk.magenta('Options:'),
        ' ' + chalk.cyan('--help') + '  provide help for this command',
        ' ' + chalk.cyan('-o') + '      an option',
        ' ' + chalk.cyan('--opt2') + '  an option',
        chalk.magenta('Aliases:'),
        ' ' + chalk.cyan('string-alias') + '  --option="a val"',
        ' ' + chalk.cyan('true-alias') + '    --option',
        ' ' + chalk.cyan('false-alias') + '   --option=false',
        ' ' + chalk.cyan('null-alias') + '    --option=null',
        ' ' + chalk.cyan('number-alias') + '  --option=123'
      ])

      done()
    })
  })

  it('provides help for each command (description, usage)', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({args: ['test'], options: {help: true}})

    app.describe('a test app')

    app.command('test').describe('test command').action(function (arg, options, d) { })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.deepEqual(output.logs(), [
        chalk.magenta('Description:') + ' test command',
        chalk.magenta('Usage:') + ' [options] test',
        chalk.magenta('Options:'),
        ' ' + chalk.cyan('--help') + '  provide help for this command'
      ])

      done()
    })
  })

  it('accept aliases', function (done) {
    var app = new Application({args: ['test'], options: {a: true}})

    app.command('test')
      .alias('a', {b: 'bb', c: 'cc'})
      .alias('x', {y: 'yy'})
      .action(function (options, d) {
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
})
