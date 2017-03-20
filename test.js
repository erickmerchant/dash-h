var test = require('tape')

test('test parse', function (t) {
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

test('test command', function (t) {
  const command = require('./command')

  t.plan(1)

  t.ok(true)

  command(function ({option, paramets}) {

  })
})
