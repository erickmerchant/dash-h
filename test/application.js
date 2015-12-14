var tap = require('tap')
var chalk = require('chalk')
var Application = require('../code/application.js')

tap.test('should run commands', function (t) {
  var app = new Application({context: {args: ['test'], options: {}}})

  app.command('test').action(function (options, d) {
    d()
  })

  app.run(function (err) {
    t.ifError(err)

    t.end()
  })
})

tap.test('should run commands that only take a callback', function (t) {
  var app = new Application({context: {args: ['test'], options: {}}})

  app.command('test').action(function (d) {
    d()
  })

  app.run(function (err) {
    t.ifError(err)

    t.end()
  })
})

tap.test('should allow promises', function (t) {
  var app = new Application({context: {args: ['test'], options: {}}})

  app.command('test').action(function () {
    return Promise.resolve()
  })

  app.run(function (err) {
    t.ifError(err)

    t.end()
  })
})

tap.test('accept arguments', function (t) {
  var app = new Application({context: {args: ['test', 'testing arguments'], options: {}}})

  app.command('test').parameter('arg1').action(function (args, options, d) {
    t.equal(args.arg1, 'testing arguments')

    d()
  })

  app.run(function (err) {
    t.ifError(err)

    t.end()
  })
})

tap.test('accept options', function (t) {
  var app = new Application({context: {args: ['test'], options: { one: 'testing' }}})

  app.command('test').action(function (options, d) {
    t.equal(options.one, 'testing')

    d()
  })

  app.run(function (err) {
    t.ifError(err)

    t.end()
  })
})

tap.test('throws an error when command is not defined', function (t) {
  var errors = []
  var app = new Application({
    context: {args: ['not-defined'], options: {}},
    error: function (err) {
      errors.push(chalk.red(err))
    }
  })

  app.run(function (err) {
    t.deepEqual(errors, [ chalk.red('Error: run help to get a list of commands') ])

    t.equal(err.message, 'run help to get a list of commands')

    t.end()
  })
})

tap.test('errors with too many arguments', function (t) {
  var errors = []
  var app = new Application({
    context: {args: ['test', '1', '2'], options: {}},
    error: function (err) {
      errors.push(chalk.red(err))
    }
  })

  app.command('test').action(function (args, options, d) {
    d(new Error('nothing bad happened'))
  })

  app.run(function (err) {
    t.deepEqual(errors, [ chalk.red('Error: too many arguments for test') ])

    t.equal(err.message, 'too many arguments for test')

    t.end()
  })
})

tap.test('errors with too few arguments (singular)', function (t) {
  var errors = []
  var app = new Application({
    context: {args: ['test', '1'], options: {}},
    error: function (err) {
      errors.push(chalk.red(err))
    }
  })

  app.command('test').parameter('arg1').parameter('arg2').action(function (args, options, d) {
    d(new Error('nothing bad happened'))
  })

  app.run(function (err) {
    t.deepEqual(errors, [ chalk.red('Error: missing argument (arg2) for test') ])

    t.equal(err.message, 'missing argument (arg2) for test')

    t.end()
  })
})

tap.test('errors with too few arguments (plural)', function (t) {
  var errors = []
  var app = new Application({
    context: {args: ['test'], options: {}},
    error: function (err) {
      errors.push(chalk.red(err))
    }
  })

  app.command('test').parameter('arg1').parameter('arg2').action(function (args, options, d) {
    d(new Error('nothing bad happened'))
  })

  app.run(function (err) {
    t.deepEqual(errors, [ chalk.red('Error: missing arguments (arg1, arg2) for test') ])

    t.equal(err.message, 'missing arguments (arg1, arg2) for test')

    t.end()
  })
})

tap.test('gathers errors from commands (thrown)', function (t) {
  var errors = []
  var app = new Application({
    context: {args: ['test'], options: {}},
    error: function (err) {
      errors.push(chalk.red(err))
    }
  })

  app.command('test').action(function (args, options, d) {
    throw new Error('nothing bad happened')
  })

  app.run(function (err) {
    t.deepEqual(errors, [ chalk.red('Error: nothing bad happened') ])

    t.equal(err.message, 'nothing bad happened')

    t.end()
  })
})

tap.test('gathers errors from commands (callback)', function (t) {
  var errors = []
  var app = new Application({
    context: {args: ['test'], options: {}},
    error: function (err) {
      errors.push(chalk.red(err))
    }
  })

  app.command('test').action(function (arg, options, d) {
    d(new Error('nothing bad happened'))
  })

  app.run(function (err) {
    t.deepEqual(errors, [ chalk.red('Error: nothing bad happened') ])

    t.equal(err.message, 'nothing bad happened')

    t.end()
  })
})

tap.test('throws an error when command is not selected', function (t) {
  var errors = []
  var app = new Application({
    context: {args: [], options: {}},
    error: function (err) {
      errors.push(chalk.red(err))
    }
  })

  app.describe('a test app')

  app.run(function (err) {
    t.deepEqual(errors, [ chalk.red('Error: run help to get a list of commands') ])

    t.equal(err.message, 'run help to get a list of commands')

    t.end()
  })
})

tap.test('provides help for the whole app (description, commands)', function (t) {
  var log = []
  var app = new Application({
    context: {args: ['help'], options: {}},
    log: function (msg) {
      log.push(msg)
    }
  })

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
    t.ifError(err)

    t.deepEqual(log, [
      chalk.magenta('Description:') + ' a test app',
      chalk.magenta('Commands:'),
      ' ' + chalk.cyan('[options] help ') + '          provides help for the application',
      ' ' + chalk.cyan('[options] test-2 <arg1>') + '  test command',
      ' ' + chalk.cyan('[options] test <arg1>') + '    test command'
    ])

    t.end()
  })
})

tap.test('provides help for the whole app (description)', function (t) {
  var log = []
  var app = new Application({
    context: {args: ['help'], options: {}},
    log: function (msg) {
      log.push(msg)
    }
  })

  app.describe('a test app')

  app.run(function (err) {
    t.ifError(err)

    t.deepEqual(log, [
      chalk.magenta('Description:') + ' a test app',
      chalk.magenta('Commands:'),
      ' ' + chalk.cyan('[options] help ') + '  provides help for the application'
    ])

    t.end()
  })
})

tap.test('provides help for the whole app', function (t) {
  var log = []
  var app = new Application({
    context: {args: ['help'], options: {}},
    log: function (msg) {
      log.push(msg)
    }
  })

  app.run(function (err) {
    t.ifError(err)

    t.deepEqual(log, [
      chalk.magenta('Commands:'),
      ' ' + chalk.cyan('[options] help ') + '  provides help for the application'
    ])

    t.end()
  })
})

tap.test('provides help for each command (description, usage, parameters, options, aliases)', function (t) {
  var log = []
  var app = new Application({
    context: {args: ['test'], options: {help: true}},
    log: function (msg) {
      log.push(msg)
    }
  })

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
    t.ifError(err)

    t.deepEqual(log, [
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

    t.end()
  })
})

tap.test('provides help for each command (description, usage)', function (t) {
  var log = []
  var app = new Application({
    context: {args: ['test'], options: {help: true}},
    log: function (msg) {
      log.push(msg)
    }
  })

  app.describe('a test app')

  app.command('test').describe('test command').action(function (arg, options, d) { })

  app.run(function (err, result) {
    t.ifError(err)

    t.deepEqual(log, [
      chalk.magenta('Description:') + ' test command',
      chalk.magenta('Usage:') + ' [options] test',
      chalk.magenta('Options:'),
      ' ' + chalk.cyan('--help') + '  provide help for this command'
    ])

    t.end()
  })
})

tap.test('accept aliases', function (t) {
  var app = new Application({context: {args: ['test'], options: {a: true}}})

  app.command('test')
    .alias('a', {b: 'bb', c: 'cc'})
    .alias('x', {y: 'yy'})
    .action(function (options, d) {
      t.equal(options.a, undefined)

      t.equal(options.b, 'bb')

      t.equal(options.c, 'cc')

      t.equal(options.y, undefined)

      d()
    })

  app.run(function (err) {
    t.ifError(err)

    t.end()
  })
})
