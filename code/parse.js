'use strict'

module.exports = function (argv) {
  var args = new Map()
  var i = 0

  while (argv.length) {
    let arg = argv.shift()

    if (arg.startsWith('--')) {
      if (arg.length > 2) {
        if (!argv.length || argv[0].startsWith('-')) {
          args.set(arg.substr(2), true)
        } else {
          args.set(arg.substr(2), argv.shift())
        }
      }
    } else {
      args.set(i, arg)

      i += 1
    }
  }

  return args
}
