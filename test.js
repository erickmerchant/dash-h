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

  t.plan(19)

  // test dashdash and parameter
  t.deepEquals(parse(['--', '-a'], {
    '0': {
      key: 'test'
    }
  }), {'test': '-a'})

  // test dashdash and parameter with type
  t.deepEquals(parse(['--', '123'], {
    '0': {
      type: Number,
      key: 'test'
    }
  }), {'test': 123})

  // test non-required parameter
  t.deepEquals(parse([], {
    '0': {
      key: 'test'
    }
  }), {})

  // test empty
  t.deepEquals(parse([''], {}), {})

  // test short
  t.deepEquals(parse(['-a'], {
    'aa-a': {
      type: Boolean,
      aliases: ['a']
    }
  }), {aaA: true})

  // test short with value
  t.deepEquals(parse(['-a=bcd'], {
    'aa-a': {
      aliases: ['a']
    }
  }), {aaA: 'bcd'})

  // test multiple short with value
  t.deepEquals(parse(['-ba=bcd'], {
    'aa-a': {
      aliases: ['a']
    },
    b: {
      type: Boolean
    }
  }), {aaA: 'bcd', b: true})

  // test multiple short
  t.deepEquals(parse(['-ba'], {
    'aa-a': {
      type: Boolean,
      aliases: ['a']
    },
    b: {
      type: Boolean
    }
  }), {aaA: true, b: true})

  // test multiple, ---, and -
  t.deepEquals(parse(['-a', 'bcd', '-a', '---', '-a', '-'], {
    'aa-a': {
      multiple: true,
      aliases: ['a']
    }
  }), {aaA: ['bcd', '---', '-']})

  // test non-empty default
  t.deepEquals(parse(['-a'], {
    'aa-a': {
      aliases: ['a'],
      default: ''
    }
  }), {aaA: ''})

  // test default with equals
  t.deepEquals(parse(['--aa-a='], {
    'aa-a': {
      aliases: ['a'],
      default: 'abc'
    }
  }), {aaA: ''})

  // test boolean with value
  try {
    parse(['-a=abc'], {
      a: {
        type: Boolean
      }
    })
  } catch (e) {
    t.equals(e.message, '-a is a boolean and does not accept a value')
  }

  // test boolean with value
  try {
    parse(['--aaa=abc'], {
      aaa: {
        type: Boolean
      }
    })
  } catch (e) {
    t.equals(e.message, '--aaa is a boolean and does not accept a value')
  }

  // test unknown
  try {
    parse(['-a'], {})
  } catch (e) {
    t.equals(e.message, 'unknown option -a')
  }

  // test unknown
  try {
    parse(['--aaa'], {})
  } catch (e) {
    t.equals(e.message, 'unknown option --aaa')
  }

  // test required
  try {
    parse([''], {
      a: {
        required: true
      }
    })
  } catch (e) {
    t.equals(e.message, '-a is required')
  }

  // test required
  try {
    parse([''], {
      aaa: {
        required: true
      }
    })
  } catch (e) {
    t.equals(e.message, '--aaa is required')
  }

  // test required parameter
  try {
    parse([], {
      '0': {
        key: 'test',
        required: true
      }
    })
  } catch (e) {
    t.equals(e.message, 'test is required')
  }

  // test too many arguments
  try {
    parse(['--', '-a'], {})
  } catch (e) {
    t.equals(e.message, 'too many arguments')
  }
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

  help('test-command', {
    '0': {
      key: 'p0',
      required: true
    },
    '1': {
      key: 'p1',
      default: 'a default'
    },
    'aaa': {
      aliases: ['aa', 'a'],
      type: Boolean,
      multiple: true,
      description: 'a Boolean'
    },
    'b': {
      type: Number,
      description: 'a Number'
    }
  })

  help('test-command', {
    '0': {
      key: 'p0',
      required: true
    }
  })

  help('test-command', {
    'aaa': {
      aliases: ['aa', 'a'],
      type: Boolean,
      multiple: true,
      description: 'a Boolean'
    }
  })

  t.plan(2)

  t.equals(1, globals.process.exitCode)

  t.deepEquals(messages, [
    chalk.green('Usage:') + ' test-command [options] p0 p1',
    '',
    chalk.green('Parameters:'),
    '',
    'p0  ' + chalk.gray('Required'),
    'p1  ' + chalk.gray('Default: a default'),
    '',
    chalk.green('Options:'),
    '',
    ' --aaa,--aa,-a  ' + chalk.gray('a Boolean. Type: Boolean. Multiple'),
    '            -b  ' + chalk.gray('a Number. Type: Number'),
    '',
    chalk.green('Usage:') + ' test-command [options] p0',
    '',
    chalk.green('Parameters:'),
    '',
    'p0  ' + chalk.gray('Required'),
    '',
    chalk.green('Usage:') + ' test-command [options] ',
    '',
    chalk.green('Options:'),
    '',
    ' --aaa,--aa,-a  ' + chalk.gray('a Boolean. Type: Boolean. Multiple'),
    ''
  ])

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

  t.equals(1, globals.process.exitCode)

  t.deepEquals(messages, [
    chalk.red('testing errors'),
    chalk.gray('at thing ') + '(file.js:123:45)',
    'at another',
    chalk.red('testing errors')
  ])

  mockery.disable()
})

test('test ./command - no help. no errors', function (t) {
  mockery.enable(mockerySettings)

  mockery.registerMock('./parse', mockedParse)

  const command = require('./command')

  t.plan(3)

  function mockedParse (argv, definitions) {
    t.deepEquals(argv, ['testing'])

    t.deepEquals(definitions, {
      '0': {
        key: 'aaa',
        testing: true
      },
      bbb: {
        testing: true
      },
      help: {
        aliases: [ 'h' ],
        description: 'get help',
        type: Boolean
      }
    })

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

  const command = require('./command')

  t.plan(2)

  function mockedParse (argv, definitions) {
    return {
      help: true
    }
  }

  function mockedHelp (name, definitions) {
    t.equals(name, 'test-command')

    t.deepEquals(definitions, {
      '0': {
        key: 'aaa',
        testing: true
      },
      bbb: {
        testing: true
      },
      help: {
        aliases: [ 'h' ],
        description: 'get help',
        type: Boolean
      }
    })
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

  const command = require('./command')

  const ourError = new Error('testing errors')

  t.plan(1)

  function mockedParse () {
    return {}
  }

  function mockedError (error) {
    t.deepEquals(error, ourError)
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

  const command = require('./command')

  const ourError = new Error('testing errors')

  t.plan(1)

  function mockedParse () {
    return {}
  }

  function mockedError (error) {
    t.deepEquals(error, ourError)
  }

  const testCommand = command('test-command', function () {
    return function () {
      return Promise.reject(ourError)
    }
  })

  testCommand(['testing'])

  mockery.disable()
})
