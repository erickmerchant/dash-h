var tap = require('tap')

var parse = require('../code/parse.js')

tap.test('should parse', function (t) {
  var context = [
    [0, 'zero'],
    ['aaa', '1'],
    ['bbb', ['2', '3']],
    ['ccc', true],
    [1, 'one']
  ]
  var parsed = parse([
    'zero',
    '--aaa',
    '1',
    '--bbb',
    '2',
    '3',
    '--ccc',
    '--',
    'one'
  ])

  t.deepEqual(Array.from(parsed), context)

  t.end()
})
