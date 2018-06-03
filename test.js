const test = require('tape')
const mockery = require('mockery')
const chalk = require('chalk')
const mockerySettings = {
  useCleanCache: true,
  warnOnReplace: false,
  warnOnUnregistered: false
}

test('test ./parse', async function (t) {
  const parse = require('./parse')

  t.plan(18)

  // test dashdash and parameter
  t.deepEquals({'test': '-a'}, await parse(['--', '-a'], {
    options: [],
    parameters: [{
      key: 'test'
    }]
  }))

  // test dashdash and parameter with type
  t.deepEquals({'test': 123}, await parse(['--', '123'], {
    options: [],
    parameters: [{
      type (val) { return Number(val) },
      key: 'test'
    }]
  }))

  // test non-required parameter
  t.deepEquals({}, await parse([], {
    options: [],
    parameters: [{
      key: 'test'
    }]
  }))

  // test empty
  t.deepEquals({}, await parse([''], {options: [], parameters: []}))

  // test short
  t.deepEquals({aaA: true}, await parse(['-a'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      aliases: ['a']
    }]
  }))

  // test short with value
  t.deepEquals({aaA: 'bcd'}, await parse(['-a=bcd'], {
    parameters: [],
    options: [{
      type (val) { return val },
      key: 'aa-a',
      aliases: ['a']
    }]
  }))

  // test multiple short with value
  t.deepEquals({aaA: 'bcd', b: true}, await parse(['-ba=bcd'], {
    parameters: [],
    options: [{
      type (val) { return val },
      key: 'aa-a',
      aliases: ['a']
    },
    {
      key: 'b'
    }]
  }))

  // test multiple short
  t.deepEquals({aaA: true, b: true}, await parse(['-ba'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      aliases: ['a']
    },
    {
      key: 'b'
    }]
  }))

  // test multiple, ---, and -
  t.deepEquals({aaA: ['bcd', '---', '-']}, await parse(['-a', 'bcd', '-a', '---', '-a', '-'], {
    parameters: [],
    options: [{
      type (val) { return val },
      key: 'aa-a',
      multiple: true,
      aliases: ['a']
    }]
  }))

  // test empty with equals
  t.deepEquals({aaA: ''}, await parse(['--aa-a='], {
    parameters: [],
    options: [{
      type (val) { return val },
      key: 'aa-a',
      aliases: ['a']
    }]
  }))

  // test default
  t.deepEquals({aaA: ''}, await parse([''], {
    parameters: [],
    options: [{
      key: 'aa-a',
      aliases: ['a'],
      type (val) {
        if (val == null) {
          return ''
        }

        return String(val)
      }
    }]
  }))

  // test default flag
  t.deepEquals({aaA: false}, await parse([''], {
    parameters: [],
    options: [{
      key: 'aa-a',
      aliases: ['a']
    }]
  }))

  // test default parameter
  t.deepEquals({'0': 'testing', '1': 'yes'}, await parse(['testing'], {
    options: [],
    parameters: [{
      key: '0'
    },
    {
      key: '1',
      type (val) {
        if (val == null) {
          return 'yes'
        }

        return String(val)
      }
    }]
  }))

  // test multiple param beginning
  t.deepEquals({'test0': [1, 2, 3, 4, 5, 6, 7], 'test1': 8, 'test2': 9},
    await parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
      options: [],
      parameters: [{
        type (val) { return val.map((v) => Number(v)) },
        key: 'test0',
        multiple: true
      },
      {
        type (val) { return Number(val) },
        key: 'test1'
      },
      {
        type (val) { return Number(val) },
        key: 'test2'
      }]
    }))

  // test multiple param middle. No type
  t.deepEquals({'test0': 1, 'test1': ['2', '3', '4', '5', '6', '7', '8'], 'test2': 9},
    await parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
      options: [],
      parameters: [{
        type (val) { return Number(val) },
        key: 'test0'
      },
      {
        key: 'test1',
        multiple: true
      },
      {
        type (val) { return Number(val) },
        key: 'test2'
      }]
    }))

  // test multiple param end
  t.deepEquals({'test0': 1, 'test1': 2, 'test2': [3, 4, 5, 6, 7, 8, 9]},
    await parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
      options: [],
      parameters: [{
        type (val) { return Number(val) },
        key: 'test0'
      },
      {
        type (val) { return Number(val) },
        key: 'test1'
      },
      {
        type (val) { return val.map((v) => Number(v)) },
        key: 'test2',
        multiple: true
      }]
    }))

  const DEFAULT = Symbol('DEFAULT')

  function FN_DEFAULT (val) {
    if (val == null) {
      return DEFAULT
    }

    return String(val)
  }

  // test default with type
  t.deepEquals({testOption: DEFAULT, testParameter: DEFAULT},
    await parse([], {
      options: [{
        key: 'test-option',
        type: FN_DEFAULT
      }],
      parameters: [{
        key: 'test-parameter',
        type: FN_DEFAULT
      }]
    }))

  // test camel-casing
  t.deepEquals({testOption: 'a string', testParameter: 'another string'},
    await parse(['--test-option', 'a string', 'another string'], {
      options: [{
        key: 'test-option',
        type (val) { return val }
      }],
      parameters: [{
        key: 'test-parameter',
        type (val) { return val }
      }]
    }))
})

test('test ./parse - with errors', async function (t) {
  mockery.enable(mockerySettings)

  const messages = []

  const globals = {
    console: {
      error (message) {
        messages.push(message)
      }
    },
    process: {
      exitCode: 0
    }
  }

  mockery.registerMock('./src/globals', globals)

  const parse = require('./parse')

  t.plan(2)

  // test non-boolean with value
  await parse(['-a'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      aliases: ['a'],
      type (val) { return val },
      multiple: true
    }]
  })

  // test boolean with value
  await parse(['-a=abc'], {
    parameters: [],
    options: [{
      key: 'a'
    }]
  })

  // test boolean with value
  await parse(['--aaa=abc'], {
    parameters: [],
    options: [{
      key: 'aaa'
    }]
  })

  // test unknown
  await parse(['-a'], {options: [], parameters: []})

  // test unknown
  await parse(['--aaa'], {options: [], parameters: []})

  // test required
  await parse([''], {
    parameters: [],
    options: [{
      key: 'a',
      required: true
    }]
  })

  // test required
  await parse([''], {
    parameters: [],
    options: [{
      key: 'aaa',
      required: true
    }]
  })

  // test non multiple multiple
  await parse(['--aaa=123', '--aaa=456'], {
    parameters: [],
    options: [{
      type (val) { return Number(val) },
      key: 'aaa'
    }]
  })

  // test required parameter
  await parse([], {
    options: [],
    parameters: [{
      key: 'test',
      required: true
    }]
  })

  // test too many arguments
  await parse(['--', '-a'], {options: [], parameters: []})

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    chalk.red('-a is not a boolean and requires a value'),
    chalk.red('-a is a boolean and does not accept a value'),
    chalk.red('--aaa is a boolean and does not accept a value'),
    chalk.red('unknown option -a'),
    chalk.red('unknown option --aaa'),
    chalk.red('-a is required'),
    chalk.red('--aaa is required'),
    chalk.red('--aaa does not accept multiple values'),
    chalk.red('test is required'),
    chalk.red('too many arguments')
  ], messages)

  mockery.disable()

  mockery.deregisterAll()
})

test('test ./help', async function (t) {
  mockery.enable(mockerySettings)

  const messages = []

  const globals = {
    console: {
      error (message) {
        messages.push(message)
      }
    },
    process: {
      exitCode: 0
    }
  }

  mockery.registerMock('./src/globals', globals)

  const help = require('./help')

  await help('test-command', '', {
    parameters: [
      {
        key: 'p0',
        description: 'the description',
        required: true
      },
      {
        key: 'p1',
        multiple: true,
        type (val) {
          if (val == null) {
            return ['a', 'b']
          }

          return val
        }
      }
    ],
    options: [
      {
        key: 'aaa',
        aliases: ['a'],
        multiple: true,
        description: 'a Boolean'
      },
      {
        key: 'b',
        required: true,
        description: 'a Number',
        type: function val (val) {
          if (val == null) {
            return 100
          }

          return Number(val)
        }
      }
    ],
    commands: []
  })

  await help('test-command', 'a test command', {
    parameters: [{
      key: 'p0',
      required: true
    }],
    options: [],
    commands: [
      {
        name: 'sub-command-b'
      },
      {
        name: 'sub-command',
        description: 'a sub command'
      }
    ]
  })

  await help('test-command', 'a test command', {
    options: [{
      key: 'aaa',
      aliases: ['a'],
      multiple: true,
      description: 'a Boolean'
    }],
    parameters: [],
    commands: []
  })

  await help('test-command', 'a test command', {options: [], parameters: [], commands: []})

  t.plan(2)

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    '',
    chalk.green('Usage:') + ' test-command [--aaa]... (-b <val>) <p0> [<p1>]...',
    '',
    chalk.green('Parameters:'),
    '',
    'p0  ' + chalk.gray('the description'),
    'p1  ' + '[default: ["a","b"]]',
    '',
    chalk.green('Options:'),
    '',
    '-a, --aaa  ' + chalk.gray('a Boolean'),
    '       -b  ' + chalk.gray('a Number') + '  [default: 100]',
    '',
    '',
    'a test command',
    '',
    chalk.green('Usage:'),
    '',
    'test-command <p0>',
    'test-command <command> [--help]',
    '',
    chalk.green('Parameters:'),
    '',
    'p0',
    '',
    chalk.green('Commands:'),
    '',
    'sub-command-b',
    'sub-command    ' + chalk.gray('a sub command'),
    '',
    '',
    'a test command',
    '',
    chalk.green('Usage:') + ' test-command [--aaa]...',
    '',
    chalk.green('Options:'),
    '',
    '-a, --aaa  ' + chalk.gray('a Boolean'),
    '',
    '',
    'a test command',
    ''
  ], messages)

  mockery.disable()

  mockery.deregisterAll()
})

test('test ./error', function (t) {
  mockery.enable(mockerySettings)

  const messages = []

  const globals = {
    process: {
      exitCode: 0
    },
    console: {
      error (message) {
        messages.push(message)
      }
    }
  }

  mockery.registerMock('./src/globals', globals)

  const error = require('./error')

  const error1 = new Error('testing errors')

  error1.stack = ['Error: testing errors', 'at thing (file.js:123:45)', 'at another'].join('\n')

  error(error1)

  const error2 = new Error('testing errors')

  error2.stack = null

  error(error2)

  error()

  t.plan(2)

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    chalk.red('Error: testing errors'),
    chalk.gray('at thing ') + '(file.js:123:45)',
    chalk.gray('at another'),
    chalk.red('Error: testing errors')
  ], messages)

  mockery.disable()

  mockery.deregisterAll()
})

test('test ./command - no help. no errors', function (t) {
  mockery.enable(mockerySettings)

  mockery.registerMock('./parse', mockedParse)

  const command = require('./main')

  t.plan(3)

  function mockedParse (argv, definitions) {
    t.deepEquals(['testing'], argv)

    t.deepEquals({
      options: [
        {
          key: 'help',
          aliases: [ 'h' ],
          description: 'get help'
        },
        {
          key: 'bbb',
          testing: true
        }
      ],
      parameters: [{
        key: 'aaa',
        testing: true
      }]
    }, definitions)

    return {}
  }

  const testCommand = command('test-command', function ({option, parameter}) {
    parameter('aaa', {
      testing: true
    })

    option('bbb', {
      testing: true
    })

    return function () {
      t.ok(true)
    }
  })

  testCommand(['testing'])

  mockery.disable()

  mockery.deregisterAll()
})

test('test ./command - help', function (t) {
  mockery.enable(mockerySettings)

  mockery.registerMock('./parse', mockedParse)

  mockery.registerMock('./help', mockedHelp)

  const command = require('./main')

  t.plan(2)

  function mockedParse (argv, definitions) {
    return {
      help: true
    }
  }

  function mockedHelp (name, description, definitions) {
    t.equals('test-command', name)

    t.deepEquals({
      options: [
        {
          key: 'help',
          aliases: [ 'h' ],
          description: 'get help'
        },
        {
          key: 'bbb',
          testing: true
        }
      ],
      parameters: [{
        key: 'aaa',
        testing: true
      }],
      commands: []
    }, definitions)
  }

  const testCommand = command('test-command', function ({parameter, option}) {
    parameter('aaa', {
      testing: true
    })

    option('bbb', {
      testing: true
    })
    return function () {}
  })

  testCommand(['testing'])

  mockery.disable()

  mockery.deregisterAll()
})

test('test ./command - thrown error', function (t) {
  mockery.enable(mockerySettings)

  mockery.registerMock('./parse', mockedParse)

  mockery.registerMock('./error', mockedError)

  const command = require('./main')

  const ourError = new Error('testing errors')

  t.plan(1)

  function mockedParse () {
    return {}
  }

  function mockedError (error) {
    t.deepEquals(ourError, error)
  }

  const testCommand = command('test-command', function () {
    return function () {
      throw ourError
    }
  })

  testCommand(['testing'])

  mockery.disable()

  mockery.deregisterAll()
})

test('test ./command - rejected promise', function (t) {
  mockery.enable(mockerySettings)

  mockery.registerMock('./parse', mockedParse)

  mockery.registerMock('./error', mockedError)

  const command = require('./main')

  const ourError = new Error('testing errors')

  t.plan(1)

  function mockedParse () {
    return {}
  }

  function mockedError (error) {
    t.deepEquals(ourError, error)
  }

  const testCommand = command('test-command', function () {
    return function () {
      return Promise.reject(ourError)
    }
  })

  testCommand(['testing'])

  mockery.disable()

  mockery.deregisterAll()
})

test('test ./command - sub commands', function (t) {
  mockery.enable(mockerySettings)

  mockery.registerMock('./parse', function () { return {} })

  const command = require('./main')

  t.plan(2)

  const testCommand = command('test-command', function ({option, parameter, command}) {
    command('sub-command', 'a sub command', function () {
      return function () {
        t.ok(true)
      }
    })

    command('sub-command-b', function () {
      return function () {
        t.ok(true)
      }
    })

    return function () {
      t.ok(false)
    }
  })

  testCommand(['sub-command'])

  testCommand(['sub-command-b'])

  mockery.disable()

  mockery.deregisterAll()
})
