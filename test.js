const test = require('tape')
const chalk = require('chalk')
const proxyquire = require('proxyquire').noPreserveCache()

test('test ./parse', (t) => {
  const parse = require('./parse')

  t.plan(18)

  // test dashdash and parameter
  t.deepEquals({ 'test': '-a' }, parse(['--', '-a'], {
    options: [],
    parameters: [{
      key: 'test'
    }]
  }))

  // test dashdash and parameter with type
  t.deepEquals({ 'test': 123 }, parse(['--', '123'], {
    options: [],
    parameters: [{
      type (val) { return Number(val) },
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
  t.deepEquals({}, parse([''], { options: [], parameters: [] }))

  // test short
  t.deepEquals({ aaA: true }, parse(['-a'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      alias: 'a'
    }]
  }))

  // test short with value
  t.deepEquals({ aaA: 'bcd' }, parse(['-a=bcd'], {
    parameters: [],
    options: [{
      type (val) { return val },
      key: 'aa-a',
      alias: 'a'
    }]
  }))

  // test multiple short with value
  t.deepEquals({ aaA: 'bcd', b: true }, parse(['-ba=bcd'], {
    parameters: [],
    options: [{
      type (val) { return val },
      key: 'aa-a',
      alias: 'a'
    },
    {
      key: 'b'
    }]
  }))

  // test multiple short
  t.deepEquals({ aaA: true, b: true }, parse(['-ba'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      alias: 'a'
    },
    {
      key: 'b'
    }]
  }))

  // test multiple, ---, and -
  t.deepEquals({ aaA: ['bcd', '---', '-'] }, parse(['-a', 'bcd', '-a', '---', '-a', '-'], {
    parameters: [],
    options: [{
      type (val) { return val },
      key: 'aa-a',
      multiple: true,
      alias: 'a'
    }]
  }))

  // test empty with equals
  t.deepEquals({ aaA: '' }, parse(['--aa-a='], {
    parameters: [],
    options: [{
      type (val) { return val },
      key: 'aa-a',
      alias: 'a'
    }]
  }))

  // test default
  t.deepEquals({ aaA: '' }, parse([''], {
    parameters: [],
    options: [{
      key: 'aa-a',
      alias: 'a',
      type (val) {
        if (val == null) {
          return ''
        }

        return String(val)
      }
    }]
  }))

  // test default flag
  t.deepEquals({ aaA: false }, parse([''], {
    parameters: [],
    options: [{
      key: 'aa-a',
      alias: 'a'
    }]
  }))

  // test default parameter
  t.deepEquals({ '0': 'testing', '1': 'yes' }, parse(['testing'], {
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
  t.deepEquals({ 'test0': [1, 2, 3, 4, 5, 6, 7], 'test1': 8, 'test2': 9 },
    parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
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
  t.deepEquals({ 'test0': 1, 'test1': ['2', '3', '4', '5', '6', '7', '8'], 'test2': 9 },
    parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
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
  t.deepEquals({ 'test0': 1, 'test1': 2, 'test2': [3, 4, 5, 6, 7, 8, 9] },
    parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
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
  t.deepEquals({ testOption: DEFAULT, testParameter: DEFAULT },
    parse([], {
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
  t.deepEquals({ testOption: 'a string', testParameter: 'another string' },
    parse(['--test-option', 'a string', 'another string'], {
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

test('test ./parse - with errors', (t) => {
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

  const parse = proxyquire('./parse', {
    './src/globals': globals
  })

  t.plan(2)

  // test non-boolean with value
  parse(['-a'], {
    parameters: [],
    options: [{
      key: 'aa-a',
      alias: 'a',
      type (val) { return val },
      multiple: true
    }]
  })

  // test boolean with value
  parse(['-a=abc'], {
    parameters: [],
    options: [{
      key: 'a'
    }]
  })

  // test boolean with value
  parse(['--aaa=abc'], {
    parameters: [],
    options: [{
      key: 'aaa'
    }]
  })

  // test unknown
  parse(['-a'], { options: [], parameters: [] })

  // test unknown
  parse(['--aaa'], { options: [], parameters: [] })

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
      type (val) { return Number(val) },
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
  parse(['--', '-a'], { options: [], parameters: [] })

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
})

test('test ./help', (t) => {
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

  const help = proxyquire('./help', {
    './src/globals': globals
  })

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
        alias: 'a',
        multiple: true,
        description: 'a Boolean'
      },
      {
        key: 'bbb',
        alias: 'b',
        required: true,
        description: 'a Number',
        type (val) {
          if (val == null) {
            return 100
          }

          return Number(val)
        }
      }
    ],
    commands: []
  })

  help('test-command', 'a test command', {
    parameters: [{
      key: 'p0',
      description: 'the description',
      required: true
    }],
    options: [{
      key: 'aaa',
      alias: 'a',
      description: 'a Boolean'
    }],
    commands: [
      {
        title: 'sub',
        description: 'a sub command',
        parameters: [{
          key: 'p1',
          description: 'the description',
          required: true
        }],
        options: [{
          key: 'bbb',
          alias: 'b',
          description: 'a Boolean'
        }],
        commands: [
          {
            title: 'sub-sub',
            description: 'a sub sub command',
            commands: [],
            parameters: [{
              key: 'p2',
              description: 'the description',
              required: true
            }],
            options: [{
              key: 'ccc',
              alias: 'c',
              description: 'a Boolean'
            }]
          }
        ]
      }
    ]
  })

  help('test-command', 'a test command', {
    options: [{
      key: 'aaa',
      alias: 'a',
      multiple: true,
      description: 'a Boolean'
    }],
    parameters: [],
    commands: []
  })

  help('test-command', 'a test command', { options: [], parameters: [], commands: [] })

  t.plan(2)

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    '',
    chalk.green('Usage:') + ' test-command [-a]... (-b <bbb>) <p0> [<p1>]...',
    '',
    chalk.green('Parameters:'),
    '',
    '<p0>                   the description',
    '<p1>                   [default: ["a","b"]]',
    '',
    chalk.green('Options:'),
    '',
    '-a, --aaa              a Boolean',
    '-b <bbb>, --bbb <bbb>  a Number [default: 100]',
    '',
    '',
    'a test command',
    '',
    chalk.green('Usage:') + ' test-command [-a] <p0>',
    '',
    chalk.green('Parameters:'),
    '',
    '<p0>       the description',
    '',
    chalk.green('Options:'),
    '',
    '-a, --aaa  a Boolean',
    '',
    chalk.green('Commands:'),
    '',
    'test-command sub [-b] <p1>',
    '',
    '  a sub command',
    '',
    'test-command sub sub-sub [-c] <p2>',
    '',
    '  a sub sub command',
    '',
    '',
    'a test command',
    '',
    chalk.green('Usage:') + ' test-command [-a]...',
    '',
    chalk.green('Options:'),
    '',
    '-a, --aaa  a Boolean',
    '',
    '',
    'a test command',
    '',
    chalk.green('Usage:') + ' test-command',
    ''
  ], messages)
})

test('test ./error', (t) => {
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

  const error = proxyquire('./error', {
    './src/globals': globals
  })

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
    'at thing (file.js:123:45)',
    'at another',
    chalk.red('Error: testing errors')
  ], messages)
})

test('test ./command - no help. no errors', (t) => {
  const command = proxyquire('./main', {
    './parse': mockedParse
  })

  t.plan(3)

  function mockedParse (argv, definitions) {
    t.deepEquals(['testing'], argv)

    t.deepEquals({
      options: [
        {
          key: 'bbb',
          testing: true
        },
        {
          key: 'help',
          alias: 'h',
          description: 'get help'
        }
      ],
      parameters: [{
        key: 'aaa',
        testing: true
      }]
    }, definitions)

    return {}
  }

  const testCommand = command('test-command', ({ option, parameter }) => {
    parameter('aaa', {
      testing: true
    })

    option('bbb', {
      testing: true
    })

    return () => {
      t.ok(true)
    }
  })

  testCommand(['testing'])
})

test('test ./command - help', (t) => {
  const command = proxyquire('./main', {
    './parse': mockedParse,
    './help': mockedHelp
  })

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
          key: 'bbb',
          testing: true
        },
        {
          key: 'help',
          alias: 'h',
          description: 'get help'
        }
      ],
      parameters: [{
        key: 'aaa',
        testing: true
      }],
      commands: []
    }, definitions)
  }

  const testCommand = command('test-command', ({ parameter, option }) => {
    parameter('aaa', {
      testing: true
    })

    option('bbb', {
      testing: true
    })

    return () => {}
  })

  testCommand(['testing'])
})

test('test ./command - thrown error', (t) => {
  const command = proxyquire('./main', {
    './parse': mockedParse,
    './error': mockedError
  })

  const ourError = new Error('testing errors')

  t.plan(1)

  function mockedParse () {
    return {}
  }

  function mockedError (error) {
    t.deepEquals(ourError, error)
  }

  const testCommand = command('test-command', () => () => {
    throw ourError
  })

  testCommand(['testing'])
})

test('test ./command - rejected promise', (t) => {
  const command = proxyquire('./main', {
    './parse': mockedParse,
    './error': mockedError
  })

  const ourError = new Error('testing errors')

  t.plan(1)

  function mockedParse () {
    return {}
  }

  function mockedError (error) {
    t.deepEquals(ourError, error)
  }

  const testCommand = command('test-command', () => async () => {
    throw ourError
  })

  testCommand(['testing'])
})

test('test ./command - sub commands', (t) => {
  const command = proxyquire('./main', {
    './parse' () { return {} }
  })

  t.plan(2)

  const testCommand = command('test-command', ({ option, parameter, command }) => {
    command('sub-command', 'a sub command', () => () => {
      t.ok(true)
    })

    command('sub-command-b', () => () => {
      t.ok(true)
    })

    return () => {
      t.ok(false)
    }
  })

  testCommand(['sub-command'])

  testCommand(['sub-command-b'])
})
