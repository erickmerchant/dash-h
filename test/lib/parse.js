var test = require('tape')

var parse = require('../../lib/parse.js')

test('should parse', function (t) {
  var parsed = parse(['--aa', '--', '-', 'abc', '--bb', '123', '-c', '[', '1', '2', '3', ']', '-d', '[', '-e', '[', '123', ']', ']', 'abc', '[', 'abc', ']'])

  t.ok(parsed instanceof Map)

  t.ok(parsed.get('aa') === true)

  t.ok(parsed.get(0) === 'abc')

  t.ok(parsed.get('bb') === '123')

  t.deepEqual(Array.from(parsed.get('c')), [
    [ 0, '1' ],
    [ 1, '2' ],
    [ 2, '3' ]
  ])

  var d = parsed.get('d')

  t.ok(d instanceof Map)

  t.deepEqual(Array.from(d.get('e')), [[ 0, '123' ]])

  t.ok(parsed.get(1) === 'abc')

  t.deepEqual(Array.from(parsed.get(2)), [[0, 'abc']])

  t.end()
})
