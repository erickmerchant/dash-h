var tap = require('tap')

var parse = require('../code/parse.js')

tap.test('should parse', function (t) {
  var context = {
    args: ['one', 'two'],
    options: {
      x: true,
      y: true,
      z: true,
      aaa: true,
      bbb: 'ccc'
    }
  }

  t.deepEqual(parse(['one', 'two', '-x', '-yz', '--aaa', '--bbb=ccc']), context)

  t.end()
})
