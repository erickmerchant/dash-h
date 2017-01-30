'use strict'

module.exports = function (argv) {
  return parse()

  function parse () {
    let args = new Map()
    let i = 0
    let level = 1

    while (argv.length && level) {
      let arg = argv.shift()

      if (arg.startsWith('-')) {
        let key = arg.startsWith('--') ? arg.substr(2) : arg.substr(1)
        let val

        if (key.length > 0) {
          if (!argv.length || argv[0].startsWith('-')) {
            val = true
          } else if (argv[0] === '[') {
            argv.shift()

            val = parse()
          } else {
            val = argv.shift()
          }

          args.set(key, val)
        }
      } else if (arg === ']') {
        level = level - 1
      } else {
        let val

        if (arg === '[') {
          val = parse()
        } else {
          val = arg
        }

        args.set(i, val)

        i += 1
      }
    }

    return args
  }
}
