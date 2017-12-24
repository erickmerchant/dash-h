const test = require('tape')
const mockery = require('mockery')
const chalk = require('chalk')
const mockerySettings = {
  useCleanCache: true,
  warnOnReplace: false,
  warnOnUnregistered: false
}

test('test ./parse', function (t) {
  const parse = require('./parse')

  t.plan(18)

  // test dashdash and parameter
  t.deepEquals({'test': '-a'}, parse(['--', '-a'], {
    options: [],
    parameters: [{
      key: 'test'
    }]
  }))

  // test dashdash and parameter with type
  t.deepEquals({'test': 123}, parse(['--', '123'], {
    options: [],
    parameters: [{
      type: Number,
      key: 'test'
    }]
  }))

  // test non-required parameter
  t.deepEquals({}, parse([], {
    options: [],
    parameters: [{
      key: 'test'
    }]
  }))

  // test empty
  t.deepEquals({}, parse([''], {options: [], parameters: []}))

  // test short
  t.deepEquals({aaA: true}, parse(['-a'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      type: Boolean,
      aliases: ['a']
    }]
  }))

  // test short with value
  t.deepEquals({aaA: 'bcd'}, parse(['-a=bcd'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      aliases: ['a']
    }]
  }))

  // test multiple short with value
  t.deepEquals({aaA: 'bcd', b: true}, parse(['-ba=bcd'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      aliases: ['a']
    },
    {
      key: 'b',
      type: Boolean
    }]
  }))

  // test multiple short
  t.deepEquals({aaA: true, b: true}, parse(['-ba'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      type: Boolean,
      aliases: ['a']
    },
    {
      key: 'b',
      type: Boolean
    }]
  }))

  // test multiple, ---, and -
  t.deepEquals({aaA: ['bcd', '---', '-']}, parse(['-a', 'bcd', '-a', '---', '-a', '-'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      multiple: true,
      aliases: ['a']
    }]
  }))

  // test non-empty default
  t.deepEquals({aaA: ['', ' ']}, parse(['-a'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      aliases: ['a'],
      type: String,
      multiple: true,
      default: { value: ['', ' '] }
    }]
  }))

  // test non-empty default
  t.deepEquals({aaA: ''}, parse(['-a'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      aliases: ['a'],
      type: String,
      multiple: true,
      default: { value: '' }
    }]
  }))

  // test default with equals
  t.deepEquals({aaA: ''}, parse(['--aa-a='], {
    parameters: [],
    options: [{
      key: 'aa-a',
      aliases: ['a'],
      default: { value: 'abc' }
    }]
  }))

  // test default parameter
  t.deepEquals({'0': 'testing', '1': 'yes'}, parse(['testing'], {
    options: [],
    parameters: [{
      key: '0'
    },
    {
      key: '1',
      default: { value: 'yes' }
    }]
  }))

  // test multiple param beginning
  t.deepEquals({'test0': [1, 2, 3, 4, 5, 6, 7], 'test1': 8, 'test2': 9},
  parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
    options: [],
    parameters: [{
      type: Number,
      key: 'test0',
      multiple: true
    },
    {
      type: Number,
      key: 'test1'
    },
    {
      type: Number,
      key: 'test2'
    }]
  }))

  // test multiple param middle. No type
  t.deepEquals({'test0': 1, 'test1': ['2', '3', '4', '5', '6', '7', '8'], 'test2': 9},
  parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
    options: [],
    parameters: [{
      type: Number,
      key: 'test0'
    },
    {
      key: 'test1',
      multiple: true
    },
    {
      type: Number,
      key: 'test2'
    }]
  }))

  // test multiple param end
  t.deepEquals({'test0': 1, 'test1': 2, 'test2': [3, 4, 5, 6, 7, 8, 9]},
  parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
    options: [],
    parameters: [{
      type: Number,
      key: 'test0'
    },
    {
      type: Number,
      key: 'test1'
    },
    {
      type: Number,
      key: 'test2',
      multiple: true
    }]
  }))

  const DEFAULT = Symbol('DEFAULT')

  // test default with type
  t.deepEquals({testOption: DEFAULT, testParameter: DEFAULT},
  parse([], {
    options: [{
      key: 'test-option',
      default: {
        value: DEFAULT
      },
      type: String
    }],
    parameters: [{
      key: 'test-parameter',
      default: {
        value: DEFAULT
      },
      type: String
    }]
  }))

  // test camel-casing
  t.deepEquals({testOption: 'a string', testParameter: 'another string'},
  parse(['--test-option', 'a string', 'another string'], {
    options: [{
      key: 'test-option',
      type: String
    }],
    parameters: [{
      key: 'test-parameter',
      type: String
    }]
  }))
})

test('test ./parse - with errors', function (t) {
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

  // test boolean with value
  parse(['-a=abc'], {
    parameters: [],
    options: [{
      key: 'a',
      type: Boolean
    }]
  })

  // test boolean with value
  parse(['--aaa=abc'], {
    parameters: [],
    options: [{
      key: 'aaa',
      type: Boolean
    }]
  })

  // test unknown
  parse(['-a'], {options: [], parameters: []})

  // test unknown
  parse(['--aaa'], {options: [], parameters: []})

  // test required
  parse([''], {
    parameters: [],
    options: [{
      key: 'a',
      required: true
    }]
  })

  // test required
  parse([''], {
    parameters: [],
    options: [{
      key: 'aaa',
      required: true
    }]
  })

  // test non multiple multiple
  parse(['--aaa=123', '--aaa=456'], {
    parameters: [],
    options: [{
      type: Number,
      key: 'aaa'
    }]
  })

  // test required parameter
  parse([], {
    options: [],
    parameters: [{
      key: 'test',
      required: true
    }]
  })

  // test too many arguments
  parse(['--', '-a'], {options: [], parameters: []})

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
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
})

test('test ./help', function (t) {
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

  help('test-command', '', {
    parameters: [
      {
        key: 'p0',
        description: 'the description',
        required: true
      },
      {
        key: 'p1',
        multiple: true,
        default: { value: ['a', 'b'] }
      }
    ],
    options: [
      {
        key: 'aaa',
        aliases: ['aa', 'a'],
        type: Boolean,
        multiple: true,
        description: 'a Boolean'
      },
      {
        key: 'b',
        type: Number,
        description: 'a Number',
        default: { value: 100 }
      }
    ],
    commands: []
  })

  help('test-command', 'a test command', {
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

  help('test-command', 'a test command', {
    options: [{
      key: 'aaa',
      aliases: ['aa', 'a'],
      type: Boolean,
      multiple: true,
      description: 'a Boolean'
    }],
    parameters: [],
    commands: []
  })

  help('test-command', 'a test command', {options: [], parameters: [], commands: []})

  t.plan(2)

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    '',
    chalk.green('Usage:') + ' test-command [--aaa,--aa,-a...] [-b=<Number>] <p0> [<p1>...]',
    '',
    chalk.green('Parameters:'),
    '',
    'p0  ' + chalk.gray('the description'),
    'p1  ' + '[default: "a", "b"]',
    '',
    chalk.green('Options:'),
    '',
    ' --aaa,--aa,-a  ' + chalk.gray('a Boolean'),
    '            -b  ' + chalk.gray('a Number') + '  [default: 100]',
    '',
    '',
    'a test command',
    '',
    chalk.green('Usage:'),
    '',
    'test-command <p0>',
    'test-command <command> [--help,-h]',
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
    chalk.green('Usage:') + ' test-command [--aaa,--aa,-a...]',
    '',
    chalk.green('Options:'),
    '',
    ' --aaa,--aa,-a  ' + chalk.gray('a Boolean'),
    '',
    '',
    'a test command',
    ''
  ], messages)

  mockery.disable()
})

test('test ./error', function (t) {
  mockery.enable(mockerySettings)

  const messages = []

  const globals = {
    process: {
      exitCode: 0
    },
    Error: function Error (message, stack) {
      this.message = message
      this.stack = stack
    },
    console: {
      error (message) {
        messages.push(message)
      }
    }
  }

  mockery.registerMock('./src/globals', globals)

  const error = require('./error')

  error(new globals.Error('testing errors', ['testing errors', 'at thing (file.js:123:45)', 'at another'].join('\n')))

  error(new globals.Error('testing errors'))

  error()

  t.plan(2)

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    chalk.red('testing errors'),
    chalk.gray('at thing ') + '(file.js:123:45)',
    chalk.gray('at another'),
    chalk.red('testing errors')
  ], messages)

  mockery.disable()
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
          description: 'get help',
          type: Boolean
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
          description: 'get help',
          type: Boolean
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
})

test('test ./command - api errors', function (t) {
  const command = require('./main')

  t.plan(3)

  t.throws(() => command('test-command', function ({option}) {
    option('a', {
      multiple: true,
      default: { value: 'a' }
    })

    return function () {
    }
  }), /the default of a should be an array/)

  t.throws(() => command('test-command', function ({option}) {
    option('a', {
      default: { value: ['a'] }
    })

    return function () {
    }
  }), /the default of a should not be an array/)

  t.throws(() => command('test-command', function ({option}) {
    option('aa', {
      type: Boolean,
      default: { value: true }
    })

    return function () {
    }
  }), /the default of aa should be false/)
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
})
