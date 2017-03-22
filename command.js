const parse = require('./parse')
const error = require('./error')
const help = require('./help')

module.exports = function (name, define) {
  const definitions = {}

  option('help', {
    type: Boolean,
    aliases: ['h'],
    description: 'get help'
  })

  let i = 0
  const action = define({option, parameter})

  return (argv) => {
    try {
      const args = parse(argv, definitions)

      if (args.help === true) {
        help(name, definitions)
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
