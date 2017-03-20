const parse = require('./parse')
const error = require('./error')
const help = require('./help')

module.exports = function (define) {
  const definitions = {}
  const action = define({option, parameter})
  let i = 0

  return function (argv) {
    try {
      const args = parse(argv, definitions)

      if (args.help === true) {
        help(definitions)

        error()
      } else {
        const result = action(args)

        if (typeof result === 'object' && result instanceof Promise) {
          result.catch(error)
        }
      }
    } catch (e) {
      error(e)
    }
  }

  function option (key, definition) {
    definitions[key] = definition
  }

  function parameter (key, definition) {
    definitions[i++] = Object.assign(definition, {key})
  }
}
