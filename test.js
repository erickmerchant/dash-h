const test = require('tape')
const {green, red} = require('kleur')
const outdent = require('outdent')
const proxyquire = require('proxyquire').noPreserveCache()

test('test ./parse.js', (t) => {
  const parse = require('./parse.js')

  t.plan(15)

  // test dashdash and positional option
  t.deepEquals({test: '-a'}, parse(['--', '-a'], {
    signature: ['test'],
    options: {
      test: {parameter: true}
    }
  }))

  // test non-required positional option
  t.deepEquals({}, parse([], {
    signature: ['test'],
    options: {
      test: {parameter: true}
    }
  }))

  // test empty
  t.deepEquals({}, parse([''], {
    signature: [],
    options: {}
  }))

  // test short
  t.deepEquals({aaa: true}, parse(['-a'], {
    signature: [],
    options: {
      aaa: {},
      a: 'aaa'
    }
  }))

  // test short with value
  t.deepEquals({aaa: 'bcd'}, parse(['-a=bcd'], {
    signature: [],
    options: {
      aaa: {
        parameter: true
      },
      a: 'aaa'
    }
  }))

  // test multiple short with value
  t.deepEquals({aaa: 'bcd', b: true}, parse(['-ba=bcd'], {
    signature: [],
    options: {
      aaa: {
        parameter: true
      },
      a: 'aaa',
      b: {}
    }
  }))

  // test multiple short
  t.deepEquals({aaa: true, b: true}, parse(['-ba'], {
    signature: [],
    options: {
      aaa: {},
      a: 'aaa',
      b: {}
    }
  }))

  // test multiple, ---, and -
  t.deepEquals({aaa: ['bcd', '---', '-']}, parse(['-a', 'bcd', '-a', '---', '-a', '-'], {
    signature: [],
    options: {
      aaa: {
        parameter: true,
        multiple: true
      },
      a: 'aaa'
    }
  }))

  // test empty with equals
  t.deepEquals({aaa: ''}, parse(['--aaa='], {
    signature: [],
    options: {
      aaa: {
        parameter: true
      },
      a: 'aaa'
    }
  }))

  // test default
  t.deepEquals({aaa: ''}, parse([''], {
    signature: [],
    options: {
      aaa: {
        default: '',
        parameter: true
      },
      a: 'aaa'
    }
  }))

  // test default flag
  t.deepEquals({aaa: false}, parse([''], {
    signature: [],
    options: {
      aaa: {
        default: ''
      },
      a: 'aaa'
    }
  }))

  // test default positional option
  t.deepEquals({0: 'testing', 1: 'yes'}, parse(['testing'], {
    signature: ['0', '1'],
    options: {
      0: {parameter: true},
      1: {
        parameter: true,
        default: 'yes'
      }
    }
  }))

  // test multiple param beginning
  t.deepEquals(
    {test0: ['1', '2', '3', '4', '5', '6', '7'], test1: '8', test2: '9'},
    parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
      signature: ['test0', 'test1', 'test2'],
      options: {
        test0: {
          multiple: true,
          parameter: true
        },
        test1: {
          parameter: true
        },
        test2: {
          parameter: true
        }
      }
    })
  )

  // test multiple param middle
  t.deepEquals(
    {test0: '1', test1: ['2', '3', '4', '5', '6', '7', '8'], test2: '9'},
    parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
      signature: ['test0', 'test1', 'test2'],
      options: {
        test0: {
          parameter: true
        },
        test1: {
          multiple: true,
          parameter: true
        },
        test2: {
          parameter: true
        }
      }
    })
  )

  // test multiple param end
  t.deepEquals(
    {test0: '1', test1: '2', test2: ['3', '4', '5', '6', '7', '8', '9']},
    parse(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
      signature: ['test0', 'test1', 'test2'],
      options: {
        test0: {
          parameter: true
        },
        test1: {
          parameter: true
        },
        test2: {
          multiple: true,
          parameter: true
        }
      }
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
    signature: [],
    options: {
      aaa: {
        parameter: true,
        multiple: true
      },
      a: 'aaa'
    }
  })

  // test boolean with value
  parse(['-a=abc'], {
    signature: [],
    options: {a: {}}
  })

  // test boolean with value
  parse(['--aaa=abc'], {
    signature: [],
    options: {aaa: {}}
  })

  // test unknown
  parse(['-a'], {signature: [], options: {}})

  // test unknown
  parse(['--aaa'], {signature: [], options: {}})

  // test required
  parse([''], {
    signature: [],
    options: {a: {required: true}}
  })

  // test required
  parse([''], {
    signature: [],
    options: {aaa: {required: true}}
  })

  // test non multiple multiple
  parse(['--aaa=123', '--aaa=456'], {
    signature: [],
    options: {aaa: {parameter: true}}
  })

  // test required parameter
  parse([], {
    signature: ['test'],
    options: {test: {required: true}}
  })

  // test too many arguments
  parse(['--', '-a'], {signature: [], options: {}})

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    red('--aaa is not a boolean and requires a value'),
    red('-a is a boolean and does not accept a value'),
    red('--aaa is a boolean and does not accept a value'),
    red('unknown option -a'),
    red('unknown option --aaa'),
    red('-a is required'),
    red('--aaa is required'),
    red('--aaa does not accept multiple values'),
    red('--test is required'),
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

  help('testing.js', {
    name: 'test-command',
    description: '',
    signature: ['p0', 'p1'],
    options: {
      p0: {
        description: 'the description',
        required: true,
        parameter: true
      },
      p1: {
        multiple: true,
        parameter: true,
        default: ['a', 'b']
      },
      aaa: {
        multiple: true,
        description: 'a Boolean'
      },
      a: 'aaa',
      bbb: {
        required: true,
        description: 'a Number',
        parameter: true,
        default: 100
      },
      b: 'bbb'
    },
    commands: []
  })

  help('testing.js', {
    name: 'test-command',
    description: 'a test command',
    signature: ['p0'],
    options: {
      p0: {
        description: 'the description',
        required: true,
        parameter: true
      },
      aaa: {
        description: 'a Boolean'
      },
      a: 'aaa'
    },
    commands: [
      {
        name: 'test-command:sub',
        description: 'a sub command',
        signature: ['p1'],
        options: {
          p1: {
            description: 'the description',
            required: true
          },
          bbb: {
            description: 'a Boolean'
          },
          b: 'bbb'
        }
      }
    ]
  })

  help('testing.js', {
    name: 'test-command',
    description: 'a test command',
    signature: [],
    options: {
      aaa: {
        multiple: true,
        description: 'a Boolean'
      },
      a: 'aaa'
    },
    commands: []
  })

  help('testing.js', {name: 'test-command', description: 'a test command'.split(' ').join('\n'), signature: [], options: {}, commands: []})

  t.plan(2)

  t.equals(globals.process.exitCode, 1)

  t.deepEquals([
    outdent`
    ${green('Usage:')} testing.js test-command --bbb <bbb> <p0> [<p1>]...

    ${green('Options:')}

     [--p0] <p0>      the description
     [--p1] <p1>      [default: ["a","b"]]
     -a, --aaa        a Boolean
     -b, --bbb <bbb>  a Number [default: 100]
    `,
    outdent`
    ${green('Description:')} a test command

    ${green('Usage:')} testing.js test-command <p0>

    ${green('Options:')}

     [--p0] <p0>  the description
     -a, --aaa    a Boolean

    ${green('Commands:')}

     testing.js test-command:sub <p1>
    `,
    outdent`
    ${green('Description:')} a test command

    ${green('Usage:')} testing.js test-command

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

  const error1 = Error('testing errors')

  error1.stack = ['Error: testing errors', 'at thing (file.js:123:45)', 'at another'].join('\n')

  error(error1)

  const error2 = Error('testing errors')

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
      signature: ['aaa'],
      options: {
        aaa: {
          description: '',
          multiple: false,
          required: false,
          parameter: false,
          default: null,
          testing: true
        },
        bbb: {
          description: '',
          multiple: false,
          required: false,
          parameter: false,
          default: null,
          testing: true
        },
        help: {
          description: 'get help',
          multiple: false,
          required: false,
          parameter: false,
          default: null
        },
        h: 'help'
      }
    }, definitions)

    return {}
  }

  const {command, start} = proxyquire('./main.js', {
    './parse.js': mockedParse,
    './help.js': () => {}
  })('test')

  t.plan(3)

  command({
    name: 'test-command',
    signature: ['aaa'],
    options: {
      aaa: {
        testing: true
      },
      bbb: {
        testing: true
      }
    },
    action() {
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

  const mockedHelp = (prefix, definitions) => {
    t.deepEquals({
      commands: [],
      name: 'test-command',
      description: '',
      signature: ['aaa'],
      options: {
        aaa: {
          description: '',
          multiple: false,
          required: false,
          parameter: false,
          default: null,
          testing: true
        },
        bbb: {
          description: '',
          multiple: false,
          required: false,
          parameter: false,
          default: null,
          testing: true
        },
        help: {
          description: 'get help',
          multiple: false,
          required: false,
          parameter: false,
          default: null
        },
        h: 'help'
      }
    }, definitions)
  }

  const {command, start} = proxyquire('./main.js', {
    './parse.js': mockedParse,
    './help.js': mockedHelp
  })('test')

  t.plan(1)

  command({
    name: 'test-command',
    signature: ['aaa'],
    options: {
      aaa: {
        testing: true
      },
      bbb: {
        testing: true
      }
    },
    action() {}
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

  const ourError = Error('testing errors')

  t.plan(1)

  command({
    name: 'test-command',
    action() {
      throw ourError
    }
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

  const ourError = Error('testing errors')

  t.plan(1)

  command({
    name: 'test-command',
    async action() {
      throw ourError
    }
  })

  start(['test-command'])
})

test('test ./command.js - sub commands', (t) => {
  const {command, start} = proxyquire('./main.js', {
    './parse.js'() { return {} },
    './help.js': () => {}
  })('test')

  t.plan(2)

  command({
    action() {
      t.ok(false)
    }
  })

  command({
    name: 'sub-command',
    action() {
      t.ok(true)
    }
  })

  command({
    name: 'sub-command-b',
    action() {
      t.ok(true)
    }
  })

  start(['sub-command'])

  start(['sub-command-b'])
})
