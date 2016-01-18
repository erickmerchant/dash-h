var tap = require('tap')

var parse = require('../code/parse.js')

tap.test('should parse', function (t) {
  var parsed = parse(['--a', '--', '-', 'abc', '--b', '123', '-c', '[', '1', '2', '3', ']', '-d', '[', '-e', '[', '123', ']', ']', 'abc'])

  t.ok(parsed instanceof Map)

  t.ok(parsed.get('a') === true)

  t.ok(parsed.get(0) === 'abc')

  t.ok(parsed.get('b') === '123')

  t.deepEqual(Array.from(parsed.get('c')), [
    [ 0, '1' ],
    [ 1, '2' ],
    [ 2, '3' ]
  ])

  var d = parsed.get('d')

  t.ok(d instanceof Map)

  t.deepEqual(Array.from(d.get('e')), [[ 0, '123' ]])

  t.ok(parsed.get(1) === 'abc')

  t.end()
})
