require('../mock/output.js')

var describe = require('mocha').describe
var assert = require('assert')
var it = require('mocha').it
var chalk = require('chalk')
var Application = require('../code/application-with-help.js')

describe('application-with-help', function () {
  it('throws an error when command is not selected', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({description: 'a test app'}, [{}])

    app.run(function (err) {
      assert.deepEqual(output.errors(), [ chalk.red('Error: run help to get a list of commands') ])

      assert.equal(err.message, 'run help to get a list of commands')

      done()
    })
  })

  it('provides help for the whole app (description, commands)', function (done) {
    var output = require('../mock/output.js')()
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

      assert.deepEqual(output.logs(), [
        chalk.magenta('Description:') + ' a test app',
        chalk.magenta('Commands:'),
        ' ' + chalk.cyan('[options] help ') + '         provides help for the application',
        ' ' + chalk.cyan('[options] test-2 <arg>') + '  test command',
        ' ' + chalk.cyan('[options] test <arg>') + '    test command'
      ])

      done()
    })
  })

  it('provides help for the whole app (description)', function (done) {
    var output = require('../mock/output.js')()
    var app = new Application({description: 'a test app'}, ['help', {}])

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
    var app = new Application({}, ['help', {}])

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
    var app = new Application({description: 'a test app'}, ['test', { help: true } ])

    app.command('test', {
      description: 'test command',
      parameters: {
        'arg': 'an argument'
      },
      options: {
        '--option': 'an option',
        '--opt2': 'an option'
      },
      aliases: {
        'string-alias': {
          option: 'a val'
        },
        'true-alias': {
          option: true
        },
        'false-alias': {
          option: false
        },
        'null-alias': {
          option: null
        },
        'number-alias': {
          option: 123
        }
      }
    }, function (arg, options, d) { })

    app.run(function (err) {
      assert.ifError(err)

      assert.deepEqual(output.logs(), [
        chalk.magenta('Description:') + ' test command',
        chalk.magenta('Usage:') + ' [options] test <arg>',
        chalk.magenta('Parameters:'),
        ' ' + chalk.cyan('arg') + '  an argument',
        chalk.magenta('Options:'),
        ' ' + chalk.cyan('--help') + '    provide help for this command',
        ' ' + chalk.cyan('--option') + '  an option',
        ' ' + chalk.cyan('--opt2') + '    an option',
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
    var app = new Application({description: 'a test app'}, ['test', { help: true } ])

    app.command('test', {
      description: 'test command'
    }, function (arg, options, d) { })

    app.run(function (err, result) {
      assert.ifError(err)

      assert.deepEqual(output.logs(), [
        chalk.magenta('Description:') + ' test command',
        chalk.magenta('Usage:') + ' [options] test <arg>',
        chalk.magenta('Options:'),
        ' ' + chalk.cyan('--help') + '  provide help for this command'
      ])

      done()
    })
  })
})
