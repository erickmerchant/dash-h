var test = require('tape')
const parse = require('./parse')

test('test parse', function (t) {
  t.plan(12)

  t.deepEquals(parse('-- -a'.split(' '), {}), {_: ['-a']})

  t.deepEquals(parse([''], {
    'aa-a': {
      type: 'boolean',
      default: false
    }
  }), {_: [], aaA: false})

  t.deepEquals(parse(['-a'], {
    'aa-a': {
      type: 'boolean',
      aliases: ['a']
    }
  }), {_: [], aaA: true})

  t.deepEquals(parse(['-a=bcd'], {
    'aa-a': {
      aliases: ['a']
    }
  }), {_: [], aaA: 'bcd'})

  t.deepEquals(parse(['-ba=bcd'], {
    'aa-a': {
      aliases: ['a']
    },
    b: {
      type: 'boolean'
    }
  }), {_: [], aaA: 'bcd', b: true})

  t.deepEquals(parse(['-ba'], {
    'aa-a': {
      type: 'boolean',
      aliases: ['a']
    },
    b: {
      type: 'boolean'
    }
  }), {_: [], aaA: true, b: true})

  t.deepEquals(parse(['-a', 'bcd', '-a', '---', '-a', '-'], {
    'aa-a': {
      multiple: true,
      aliases: ['a']
    }
  }), {_: [], aaA: ['bcd', '---', '-']})

  t.deepEquals(parse(['-a'], {
    'aa-a': {
      aliases: ['a'],
      default: ''
    }
  }), {_: [], aaA: ''})

  t.deepEquals(parse(['-a=123', '-a=456'], {
    'aa-a': {
      type: 'number',
      multiple: true,
      aliases: ['a']
    }
  }), {_: [], aaA: [123, 456]})

  try {
    parse(['-a'], {})
  } catch (e) {
    t.equals(e.message, 'unknown option a')
  }

  try {
    parse(['--aaa'], {})
  } catch (e) {
    t.equals(e.message, 'unknown option aaa')
  }

  try {
    parse([''], {
      a: {
        required: true
      }
    })
  } catch (e) {
    t.equals(e.message, 'a is required')
  }
})
