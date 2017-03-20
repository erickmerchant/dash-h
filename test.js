var test = require('tape')
const parse = require('./parse')

test('test parse', function (t) {
  t.plan(15)

  // test dashdash
  t.deepEquals(parse('-- -a'.split(' '), {}), {_: ['-a']})

  // test empty
  t.deepEquals(parse([''], {}), {_: []})

  // test short
  t.deepEquals(parse(['-a'], {
    'aa-a': {
      type: Boolean,
      aliases: ['a']
    }
  }), {_: [], aaA: true})

  // test short with value
  t.deepEquals(parse(['-a=bcd'], {
    'aa-a': {
      aliases: ['a']
    }
  }), {_: [], aaA: 'bcd'})

  // test multiple short with value
  t.deepEquals(parse(['-ba=bcd'], {
    'aa-a': {
      aliases: ['a']
    },
    b: {
      type: Boolean
    }
  }), {_: [], aaA: 'bcd', b: true})

  // test multiple short
  t.deepEquals(parse(['-ba'], {
    'aa-a': {
      type: Boolean,
      aliases: ['a']
    },
    b: {
      type: Boolean
    }
  }), {_: [], aaA: true, b: true})

  // test multiple, ---, and -
  t.deepEquals(parse(['-a', 'bcd', '-a', '---', '-a', '-'], {
    'aa-a': {
      multiple: true,
      aliases: ['a']
    }
  }), {_: [], aaA: ['bcd', '---', '-']})

  // test non-empty default
  t.deepEquals(parse(['-a'], {
    'aa-a': {
      aliases: ['a'],
      default: ''
    }
  }), {_: [], aaA: ''})

  // test default with equals
  t.deepEquals(parse(['--aa-a='], {
    'aa-a': {
      aliases: ['a'],
      default: 'abc'
    }
  }), {_: [], aaA: ''})

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
})
