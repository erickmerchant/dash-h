'use strict'

module.exports = function (argv) {
  var args = new Map()
  var i = 0

  while (argv.length) {
    let arg = argv.shift()

    if (arg.startsWith('--')) {
      if (arg.length > 2) {
        let key = arg.substr(2)
        let values = args.has(key) ? args.get(key) : []

        while (!argv.length || !argv[0].startsWith('-')) {
          values.push(argv.shift())
        }

        if (!values.length) {
          args.set(key, true)
        } else if (values.length > 1) {
          args.set(key, values)
        } else {
          args.set(key, values[0])
        }
      }
    } else if (arg.startsWith('-')) {
      arg.substr(1).split('').forEach(function (v) {
        args.set(v, true)
      })
    } else {
      args.set(i, arg)

      i += 1
    }
  }

  return args
}
