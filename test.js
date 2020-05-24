const test = require('ava')
const {green, red} = require('kleur')
const outdent = require('outdent')
const proxyquire = require('proxyquire').noPreserveCache()
const delay = require('delay')

test('test ./parse.js', (t) => {
  const parse = require('./parse.js')

  // test dashdash and positional option
  t.deepEqual(
    {test: '-a'},
    parse(['--', '-a'], {
      signature: ['test'],
      options: {
        test: {parameter: true}
      }
    })
  )

  // test non-required positional option
  t.deepEqual(
    {},
    parse([], {
      signature: ['test'],
      options: {
        test: {parameter: true}
      }
    })
  )

  // test empty
  t.deepEqual(
    {},
    parse([''], {
      signature: [],
      options: {}
    })
  )

  // test short
  t.deepEqual(
    {aaa: true},
    parse(['-a'], {
      signature: [],
      options: {
        aaa: {},
        a: 'aaa'
      }
    })
  )

  // test short with value
  t.deepEqual(
    {aaa: 'bcd'},
    parse(['-a=bcd'], {
      signature: [],
      options: {
        aaa: {
          parameter: true
        },
        a: 'aaa'
      }
    })
  )

  // test multiple short with value
  t.deepEqual(
    {aaa: 'bcd', b: true},
    parse(['-ba=bcd'], {
      signature: [],
      options: {
        aaa: {
          parameter: true
        },
        a: 'aaa',
        b: {}
      }
    })
  )

  // test multiple short
  t.deepEqual(
    {aaa: true, b: true},
    parse(['-ba'], {
      signature: [],
      options: {
        aaa: {},
        a: 'aaa',
        b: {}
      }
    })
  )

  // test multiple, ---, and -
  t.deepEqual(
    {aaa: ['bcd', '---', '-']},
    parse(['-a', 'bcd', '-a', '---', '-a', '-'], {
      signature: [],
      options: {
        aaa: {
          parameter: true,
          multiple: true
        },
        a: 'aaa'
      }
    })
  )

  // test empty with deepEqual
  t.deepEqual(
    {aaa: ''},
    parse(['--aaa='], {
      signature: [],
      options: {
        aaa: {
          parameter: true
        },
        a: 'aaa'
      }
    })
  )

  // test default
  t.deepEqual(
    {aaa: ''},
    parse([''], {
      signature: [],
      options: {
        aaa: {
          default: '',
          parameter: true
        },
        a: 'aaa'
      }
    })
  )

  // test default flag
  t.deepEqual(
    {aaa: false},
    parse([''], {
      signature: [],
      options: {
        aaa: {
          default: ''
        },
        a: 'aaa'
      }
    })
  )

  // test default positional option
  t.deepEqual(
    {0: 'testing', 1: 'yes'},
    parse(['testing'], {
      signature: ['0', '1'],
      options: {
        0: {parameter: true},
        1: {
          parameter: true,
          default: 'yes'
        }
      }
    })
  )

  // test multiple param beginning
  t.deepEqual(
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
  t.deepEqual(
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
  t.deepEqual(
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
    './lib/globals.js': globals
  })

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

  t.deepEqual(globals.process.exitCode, 1)

  t.deepEqual(
    [
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
    ],
    messages
  )
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
    './lib/globals.js': globals
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
      p: 'p0',
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

  help('testing.js', {
    name: 'test-command',
    description: 'a test command'.split(' ').join('\n'),
    signature: [],
    options: {},
    commands: []
  })

  t.deepEqual(globals.process.exitCode, 1)

  t.deepEqual(
    [
      outdent`
    ${green('Usage:')} testing.js test-command --bbb <bbb> <p0> [<p1>]...

    ${green('Options:')}

     [-p, --p0] <p0>  the description
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
    ],
    messages
  )
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
    './lib/globals.js': globals
  })

  const error1 = Error('testing errors')

  error1.stack = [
    'Error: testing errors',
    'at thing (file.js:123:45)',
    'at another'
  ].join('\n')

  error(error1)

  const error2 = Error('testing errors')

  error2.stack = null

  error(error2)

  error()

  t.deepEqual(globals.process.exitCode, 1)

  t.deepEqual(
    [
      outdent`
    ${red('Error: testing errors')}
    at thing (file.js:123:45)
    at another
    `,
      outdent`
    ${red('Error: testing errors')}
    `
    ],
    messages
  )
})

test('test ./command.js - no help. no errors', async (t) => {
  const mockedParse = (argv, definitions) => {
    t.deepEqual([], argv)

    t.deepEqual(
      {
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
      },
      definitions
    )

    return {}
  }

  const {command, start} = proxyquire('./main.js', {
    './parse.js': mockedParse,
    './help.js'() {}
  })('test')

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
      t.pass()
    }
  })

  start(['test-command'])

  await delay(0)
})

test('test ./command.js - help', async (t) => {
  const mockedParse = (argv, definitions) => {
    return {
      help: true
    }
  }

  const mockedHelp = (prefix, definitions) => {
    t.deepEqual(
      {
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
      },
      definitions
    )
  }

  const {command, start} = proxyquire('./main.js', {
    './parse.js': mockedParse,
    './help.js': mockedHelp
  })('test')

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

  await delay(0)
})

test('test ./command.js - thrown error', async (t) => {
  const mockedParse = () => {
    return {}
  }

  const mockedError = (error) => {
    t.deepEqual(ourError, error)
  }

  const {command, start} = proxyquire('./main.js', {
    './parse.js': mockedParse,
    './error.js': mockedError,
    './help.js'() {}
  })('test')

  const ourError = Error('testing errors')

  command({
    name: 'test-command',
    action() {
      throw ourError
    }
  })

  start(['test-command'])

  await delay(0)
})

test('test ./command.js - rejected promise', async (t) => {
  const mockedParse = () => {
    return {}
  }

  const mockedError = (error) => {
    t.deepEqual(ourError, error)
  }

  const {command, start} = proxyquire('./main.js', {
    './parse.js': mockedParse,
    './error.js': mockedError,
    './help.js'() {}
  })('test')

  const ourError = Error('testing errors')

  command({
    name: 'test-command',
    async action() {
      throw ourError
    }
  })

  start(['test-command'])

  await delay(0)
})

test('test ./command.js - sub commands', async (t) => {
  const {command, start} = proxyquire('./main.js', {
    './parse.js'() {
      return {}
    },
    './help.js'() {}
  })('test')

  command({
    action() {
      t.fail()
    }
  })

  command({
    name: 'sub-command',
    action() {
      t.pass()
    }
  })

  command({
    name: 'sub-command-b',
    action() {
      t.pass()
    }
  })

  start(['sub-command'])

  start(['sub-command-b'])

  await delay(0)
})
