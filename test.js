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

  t.plan(15)

  // test dashdash and parameter
  t.deepEquals({'test': '-a'}, parse(['--', '-a'], {
    '0': {
      key: 'test'
    }
  }))

  // test dashdash and parameter with type
  t.deepEquals({'test': 123}, parse(['--', '123'], {
    '0': {
      type: Number,
      key: 'test'
    }
  }))

  // test non-required parameter
  t.deepEquals({}, parse([], {
    '0': {
      key: 'test'
    }
  }))

  // test empty
  t.deepEquals({}, parse([''], {}))

  // test short
  t.deepEquals({aaA: true}, parse(['-a'], {
    'aa-a': {
      key: 'aa-a',
      type: Boolean,
      aliases: ['a']
    }
  }))

  // test short with value
  t.deepEquals({aaA: 'bcd'}, parse(['-a=bcd'], {
    'aa-a': {
      key: 'aa-a',
      aliases: ['a']
    }
  }))

  // test multiple short with value
  t.deepEquals({aaA: 'bcd', b: true}, parse(['-ba=bcd'], {
    'aa-a': {
      key: 'aa-a',
      aliases: ['a']
    },
    b: {
      key: 'b',
      type: Boolean
    }
  }))

  // test multiple short
  t.deepEquals({aaA: true, b: true}, parse(['-ba'], {
    'aa-a': {
      key: 'aa-a',
      type: Boolean,
      aliases: ['a']
    },
    b: {
      key: 'b',
      type: Boolean
    }
  }))

  // test multiple, ---, and -
  t.deepEquals({aaA: ['bcd', '---', '-']}, parse(['-a', 'bcd', '-a', '---', '-a', '-'], {
    'aa-a': {
      key: 'aa-a',
      multiple: true,
      aliases: ['a']
    }
  }))

  // test non-empty default
  t.deepEquals({aaA: ''}, parse(['-a'], {
    'aa-a': {
      key: 'aa-a',
      aliases: ['a'],
      default: ''
    }
  }))

  // test default with equals
  t.deepEquals({aaA: ''}, parse(['--aa-a='], {
    'aa-a': {
      key: 'aa-a',
      aliases: ['a'],
      default: 'abc'
    }
  }))

  // test default parameter
  t.deepEquals({'0': 'testing', '1': 'yes'}, parse(['testing'], {
    '0': {
      key: '0'
    },
    '1': {
      key: '1',
      default: 'yes'
    }
  }))

  // test multiple param beginning
  t.deepEquals({'test0': [1, 2, 3, 4, 5, 6, 7], 'test1': 8, 'test2': 9},
  parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
    '0': {
      type: Number,
      key: 'test0',
      multiple: true
    },
    '1': {
      type: Number,
      key: 'test1'
    },
    '2': {
      type: Number,
      key: 'test2'
    }
  }))

  // test multiple param middle. No type
  t.deepEquals({'test0': 1, 'test1': ['2', '3', '4', '5', '6', '7', '8'], 'test2': 9},
  parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
    '0': {
      type: Number,
      key: 'test0'
    },
    '1': {
      key: 'test1',
      multiple: true
    },
    '2': {
      type: Number,
      key: 'test2'
    }
  }))

  // test multiple param end
  t.deepEquals({'test0': 1, 'test1': 2, 'test2': [3, 4, 5, 6, 7, 8, 9]},
  parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
    '0': {
      type: Number,
      key: 'test0'
    },
    '1': {
      type: Number,
      key: 'test1'
    },
    '2': {
      type: Number,
      key: 'test2',
      multiple: true
    }
  }))
})

test('test ./parse - with errors', function (t) {
  mockery.enable(mockerySettings)

  const messages = []

  const globals = {
    console: {
      error: function (message) {
        messages.push(message)
      }
    },
    process: {
      exitCode: 0
    }
  }

  mockery.registerMock('./globals', globals)

  const parse = require('./parse')

  t.plan(2)

  // test boolean with value
  parse(['-a=abc'], {
    a: {
      key: 'a',
      type: Boolean
    }
  })

  // test boolean with value
  parse(['--aaa=abc'], {
    aaa: {
      key: 'aaa',
      type: Boolean
    }
  })

  // test unknown
  parse(['-a'], {})

  // test unknown
  parse(['--aaa'], {})

  // test required
  parse([''], {
    a: {
      key: 'a',
      required: true
    }
  })

  // test required
  parse([''], {
    aaa: {
      key: 'aaa',
      required: true
    }
  })

  // test required parameter
  parse([], {
    '0': {
      key: 'test',
      required: true
    }
  })

  // test too many arguments
  parse(['--', '-a'], {})

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    chalk.red('-a is a boolean and does not accept a value'),
    chalk.red('--aaa is a boolean and does not accept a value'),
    chalk.red('unknown option -a'),
    chalk.red('unknown option --aaa'),
    chalk.red('-a is required'),
    chalk.red('--aaa is required'),
    chalk.red('test is required'),
    chalk.red('too many arguments')
  ].join('\n'), messages.join('\n'))

  mockery.disable()
})

test('test ./help', function (t) {
  mockery.enable(mockerySettings)

  const messages = []

  const globals = {
    console: {
      error: function (message) {
        messages.push(message)
      }
    },
    process: {
      exitCode: 0
    }
  }

  mockery.registerMock('./globals', globals)

  const help = require('./help')

  help('test-command', '', {
    '0': {
      key: 'p0',
      multiple: true,
      required: true
    },
    '1': {
      key: 'p1',
      default: 'a default'
    },
    'aaa': {
      key: 'aaa',
      aliases: ['aa', 'a'],
      type: Boolean,
      multiple: true,
      description: 'a Boolean'
    },
    'b': {
      key: 'b',
      type: Number,
      description: 'a Number'
    }
  })

  help('test-command', 'a test command', {
    '0': {
      key: 'p0',
      required: true
    }
  }, {
    'sub-command-b': {
    },
    'sub-command': {
      description: 'a sub command'
    }
  })

  help('test-command', 'a test command', {
    'aaa': {
      key: 'aaa',
      aliases: ['aa', 'a'],
      type: Boolean,
      multiple: true,
      description: 'a Boolean'
    }
  })

  help('test-command', 'a test command', {})

  t.plan(2)

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    '',
    chalk.green('Usage:') + ' test-command [--aaa,--aa,-a...] [-b=<Number>] <p0>... [<p1>]',
    '',
    chalk.green('Parameters:'),
    '',
    'p0',
    'p1  ' + chalk.gray('[default: "a default"]'),
    '',
    chalk.green('Options:'),
    '',
    ' --aaa,--aa,-a  ' + chalk.gray('a Boolean'),
    '            -b  ' + chalk.gray('a Number'),
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
  ].join('\n'), messages.join('\n'))

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
      error: function (message) {
        messages.push(message)
      }
    }
  }

  mockery.registerMock('./globals', globals)

  const error = require('./error')

  error(new globals.Error('testing errors', ['testing errors', 'at thing (file.js:123:45)', 'at another'].join('\n')))

  error(new globals.Error('testing errors'))

  error()

  t.plan(2)

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    chalk.red('testing errors'),
    chalk.gray('at thing ') + '(file.js:123:45)',
    'at another',
    chalk.red('testing errors')
  ].join('\n'), messages.join('\n'))

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
      '0': {
        key: 'aaa',
        testing: true
      },
      bbb: {
        key: 'bbb',
        testing: true
      },
      help: {
        key: 'help',
        aliases: [ 'h' ],
        description: 'get help',
        type: Boolean
      }
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
      '0': {
        key: 'aaa',
        testing: true
      },
      bbb: {
        key: 'bbb',
        testing: true
      },
      help: {
        key: 'help',
        aliases: [ 'h' ],
        description: 'get help',
        type: Boolean
      }
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

test('test ./command - sub commands', function (t) {
  mockery.enable(mockerySettings)

  mockery.registerMock('./parse', () => { return {} })

  const command = require('./main')

  t.plan(2)

  const testCommand = command('test-command', function ({option, parameter, command}) {
    command('sub-command', 'a sub command', () => {
      return function () {
        t.ok(true)
      }
    })

    command('sub-command-b', () => {
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
