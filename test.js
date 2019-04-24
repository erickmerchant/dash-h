const test = require('tape')
const {green, red} = require('kleur')
const outdent = require('outdent')
const proxyquire = require('proxyquire').noPreserveCache()

test('test ./parse.js', (t) => {
  const parse = require('./parse.js')

  t.plan(18)

  // test dashdash and parameter
  t.deepEquals({test: '-a'}, parse(['--', '-a'], {
    options: [],
    parameters: [{
      name: 'test'
    }]
  }))

  // test dashdash and parameter with type
  t.deepEquals({test: 123}, parse(['--', '123'], {
    options: [],
    parameters: [{
      type(val) { return Number(val) },
      name: 'test'
    }]
  }))

  // test non-required parameter
  t.deepEquals({}, parse([], {
    options: [],
    parameters: [{
      name: 'test'
    }]
  }))

  // test empty
  t.deepEquals({}, parse([''], {options: [], parameters: []}))

  // test short
  t.deepEquals({aaA: true}, parse(['-a'], {
    parameters: [],
    options: [{
      name: 'aa-a',
      alias: 'a'
    }]
  }))

  // test short with value
  t.deepEquals({aaA: 'bcd'}, parse(['-a=bcd'], {
    parameters: [],
    options: [{
      type(val) { return val },
      name: 'aa-a',
      alias: 'a'
    }]
  }))

  // test multiple short with value
  t.deepEquals({aaA: 'bcd', b: true}, parse(['-ba=bcd'], {
    parameters: [],
    options: [{
      type(val) { return val },
      name: 'aa-a',
      alias: 'a'
    },
    {
      name: 'b'
    }]
  }))

  // test multiple short
  t.deepEquals({aaA: true, b: true}, parse(['-ba'], {
    parameters: [],
    options: [{
      name: 'aa-a',
      alias: 'a'
    },
    {
      name: 'b'
    }]
  }))

  // test multiple, ---, and -
  t.deepEquals({aaA: ['bcd', '---', '-']}, parse(['-a', 'bcd', '-a', '---', '-a', '-'], {
    parameters: [],
    options: [{
      type(val) { return val },
      name: 'aa-a',
      multiple: true,
      alias: 'a'
    }]
  }))

  // test empty with equals
  t.deepEquals({aaA: ''}, parse(['--aa-a='], {
    parameters: [],
    options: [{
      type(val) { return val },
      name: 'aa-a',
      alias: 'a'
    }]
  }))

  // test default
  t.deepEquals({aaA: ''}, parse([''], {
    parameters: [],
    options: [{
      name: 'aa-a',
      alias: 'a',
      type(val) {
        if (val == null) {
          return ''
        }

        return String(val)
      }
    }]
  }))

  // test default flag
  t.deepEquals({aaA: false}, parse([''], {
    parameters: [],
    options: [{
      name: 'aa-a',
      alias: 'a'
    }]
  }))

  // test default parameter
  t.deepEquals({0: 'testing', 1: 'yes'}, parse(['testing'], {
    options: [],
    parameters: [{
      name: '0'
    },
    {
      name: '1',
      type(val) {
        if (val == null) {
          return 'yes'
        }

        return String(val)
      }
    }]
  }))

  // test multiple param beginning
  t.deepEquals(
    {test0: [1, 2, 3, 4, 5, 6, 7], test1: 8, test2: 9},
    parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
      options: [],
      parameters: [{
        type(val) { return val.map((v) => Number(v)) },
        name: 'test0',
        multiple: true
      },
      {
        type(val) { return Number(val) },
        name: 'test1'
      },
      {
        type(val) { return Number(val) },
        name: 'test2'
      }]
    })
  )

  // test multiple param middle. No type
  t.deepEquals(
    {test0: 1, test1: ['2', '3', '4', '5', '6', '7', '8'], test2: 9},
    parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
      options: [],
      parameters: [{
        type(val) { return Number(val) },
        name: 'test0'
      },
      {
        name: 'test1',
        multiple: true
      },
      {
        type(val) { return Number(val) },
        name: 'test2'
      }]
    })
  )

  // test multiple param end
  t.deepEquals(
    {test0: 1, test1: 2, test2: [3, 4, 5, 6, 7, 8, 9]},
    parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
      options: [],
      parameters: [{
        type(val) { return Number(val) },
        name: 'test0'
      },
      {
        type(val) { return Number(val) },
        name: 'test1'
      },
      {
        type(val) { return val.map((v) => Number(v)) },
        name: 'test2',
        multiple: true
      }]
    })
  )

  const DEFAULT = Symbol('DEFAULT')

  const FN_DEFAULT = (val) => {
    if (val == null) {
      return DEFAULT
    }

    return String(val)
  }

  // test default with type
  t.deepEquals(
    {testOption: DEFAULT, testParameter: DEFAULT},
    parse([], {
      options: [{
        name: 'test-option',
        type: FN_DEFAULT
      }],
      parameters: [{
        name: 'test-parameter',
        type: FN_DEFAULT
      }]
    })
  )

  // test camel-casing
  t.deepEquals(
    {testOption: 'a string', testParameter: 'another string'},
    parse(['--test-option', 'a string', 'another string'], {
      options: [{
        name: 'test-option',
        type(val) { return val }
      }],
      parameters: [{
        name: 'test-parameter',
        type(val) { return val }
      }]
    })
  )
})

test('test ./parse.js - with errors', (t) => {
  const messages = []

  const globals = {
    console: {
      error(message) {
        messages.push(message.trim())
      }
    },
    process: {
      exitCode: 0
    }
  }

  const parse = proxyquire('./parse.js', {
    './src/globals.js': globals
  })

  t.plan(2)

  // test non-boolean with value
  parse(['-a'], {
    parameters: [],
    options: [{
      name: 'aa-a',
      alias: 'a',
      type(val) { return val },
      multiple: true
    }]
  })

  // test boolean with value
  parse(['-a=abc'], {
    parameters: [],
    options: [{
      name: 'a'
    }]
  })

  // test boolean with value
  parse(['--aaa=abc'], {
    parameters: [],
    options: [{
      name: 'aaa'
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
      name: 'a',
      required: true
    }]
  })

  // test required
  parse([''], {
    parameters: [],
    options: [{
      name: 'aaa',
      required: true
    }]
  })

  // test non multiple multiple
  parse(['--aaa=123', '--aaa=456'], {
    parameters: [],
    options: [{
      type(val) { return Number(val) },
      name: 'aaa'
    }]
  })

  // test required parameter
  parse([], {
    options: [],
    parameters: [{
      name: 'test',
      required: true
    }]
  })

  // test too many arguments
  parse(['--', '-a'], {options: [], parameters: []})

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    red('-a is not a boolean and requires a value'),
    red('-a is a boolean and does not accept a value'),
    red('--aaa is a boolean and does not accept a value'),
    red('unknown option -a'),
    red('unknown option --aaa'),
    red('-a is required'),
    red('--aaa is required'),
    red('--aaa does not accept multiple values'),
    red('test is required'),
    red('too many arguments')
  ], messages)
})

test('test ./help.js', (t) => {
  const messages = []

  const globals = {
    console: {
      log(message) {
        messages.push(message.trim())
      }
    },
    process: {
      exitCode: 0
    }
  }

  const help = proxyquire('./help.js', {
    './src/globals.js': globals
  })

  help('testing.js', ['test-command'], '', {
    parameters: [
      {
        name: 'p0',
        description: 'the description',
        required: true
      },
      {
        name: 'p1',
        multiple: true,
        type(val) {
          if (val == null) {
            return ['a', 'b']
          }

          return val
        }
      }
    ],
    options: [
      {
        name: 'aaa',
        alias: 'a',
        multiple: true,
        description: 'a Boolean'
      },
      {
        name: 'bbb',
        alias: 'b',
        required: true,
        description: 'a Number',
        type(val) {
          if (val == null) {
            return 100
          }

          return Number(val)
        }
      }
    ],
    commands: []
  })

  help('testing.js', ['test-command'], 'a test command', {
    parameters: [{
      name: 'p0',
      description: 'the description',
      required: true
    }],
    options: [{
      name: 'aaa',
      alias: 'a',
      description: 'a Boolean'
    }],
    commands: [
      {
        command: ['test-command', 'sub'],
        description: 'a sub command',
        parameters: [{
          name: 'p1',
          description: 'the description',
          required: true
        }],
        options: [{
          name: 'bbb',
          alias: 'b',
          description: 'a Boolean'
        }]
      }
    ]
  })

  help('testing.js', ['test-command'], 'a test command', {
    options: [{
      name: 'aaa',
      alias: 'a',
      multiple: true,
      description: 'a Boolean'
    }],
    parameters: [],
    commands: []
  })

  help('testing.js', ['test-command'], 'a test command'.split(' ').join('\n'), {options: [], parameters: [], commands: []})

  t.plan(2)

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    outdent`
    ${green('Usage:')} testing.js test-command [-a]... (-b <bbb>) <p0> [<p1>]...

    ${green('Parameters:')}

     <p0>             the description
     <p1>             [default: ["a","b"]]

    ${green('Options:')}

     -a, --aaa        a Boolean
     -b, --bbb <bbb>  a Number [default: 100]
    `,
    outdent`
    ${green('Description:')} a test command

    ${green('Usage:')} testing.js test-command [-a] <p0>

    ${green('Parameters:')}

     <p0>       the description

    ${green('Options:')}

     -a, --aaa  a Boolean

    ${green('Commands:')}

     testing.js test-command sub [-b] <p1>
    `,
    outdent`
    ${green('Description:')} a test command

    ${green('Usage:')} testing.js test-command [-a]...

    ${green('Options:')}

     -a, --aaa  a Boolean
    `,
    outdent`
    ${green('Description:')}

    a
    test
    command

    ${green('Usage:')} testing.js test-command
    `
  ], messages)
})

test('test ./error.js', (t) => {
  const messages = []

  const globals = {
    process: {
      exitCode: 0
    },
    console: {
      error(message) {
        messages.push(message.trim())
      }
    }
  }

  const error = proxyquire('./error.js', {
    './src/globals.js': globals
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
    outdent`
    ${red('Error: testing errors')}
    at thing (file.js:123:45)
    at another
    `,
    outdent`
    ${red('Error: testing errors')}
    `
  ], messages)
})

test('test ./command.js - no help. no errors', (t) => {
  const mockedParse = (argv, definitions) => {
    t.deepEquals([], argv)

    t.deepEquals({
      options: [
        {
          name: 'bbb',
          testing: true
        },
        {
          name: 'help',
          alias: 'h',
          description: 'get help'
        }
      ],
      parameters: [{
        name: 'aaa',
        testing: true
      }]
    }, definitions)

    return {}
  }

  const {command, start} = proxyquire('./main.js', {
    './parse.js': mockedParse,
    './help.js': () => {}
  })('test')

  t.plan(3)

  command(['test-command'], ({option, parameter}) => {
    parameter({
      name: 'aaa',
      testing: true
    })

    option({
      name: 'bbb',
      testing: true
    })

    return () => {
      t.ok(true)
    }
  })

  start(['test-command'])
})

test('test ./command.js - help', (t) => {
  const mockedParse = (argv, definitions) => {
    return {
      help: true
    }
  }

  const mockedHelp = (name, command, description, definitions) => {
    t.deepEquals(['test-command'], command)

    t.deepEquals({
      options: [
        {
          name: 'bbb',
          testing: true
        },
        {
          name: 'help',
          alias: 'h',
          description: 'get help'
        }
      ],
      parameters: [{
        name: 'aaa',
        testing: true
      }],
      commands: []
    }, definitions)
  }

  const {command, start} = proxyquire('./main.js', {
    './parse.js': mockedParse,
    './help.js': mockedHelp
  })('test')

  t.plan(2)

  command(['test-command'], ({parameter, option}) => {
    parameter({
      name: 'aaa',
      testing: true
    })

    option({
      name: 'bbb',
      testing: true
    })

    return () => {}
  })

  start(['test-command'])
})

test('test ./command.js - thrown error', (t) => {
  const mockedParse = () => { return {} }

  const mockedError = (error) => {
    t.deepEquals(ourError, error)
  }

  const {command, start} = proxyquire('./main.js', {
    './parse.js': mockedParse,
    './error.js': mockedError,
    './help.js': () => {}
  })('test')

  const ourError = new Error('testing errors')

  t.plan(1)

  command(['test-command'], () => () => {
    throw ourError
  })

  start(['test-command'])
})

test('test ./command.js - rejected promise', (t) => {
  const mockedParse = () => { return {} }

  const mockedError = (error) => {
    t.deepEquals(ourError, error)
  }

  const {command, start} = proxyquire('./main.js', {
    './parse.js': mockedParse,
    './error.js': mockedError,
    './help.js': () => {}
  })('test')

  const ourError = new Error('testing errors')

  t.plan(1)

  command(['test-command'], () => async () => {
    throw ourError
  })

  start(['test-command'])
})

test('test ./command.js - sub commands', (t) => {
  const {command, start} = proxyquire('./main.js', {
    './parse.js'() { return {} },
    './help.js': () => {}
  })('test')

  t.plan(2)

  command(() => () => {
    t.ok(false)
  })

  command(['sub-command'], () => () => {
    t.ok(true)
  })

  command(['sub-command-b'], () => () => {
    t.ok(true)
  })

  start(['sub-command'])

  start(['sub-command-b'])
})
