const parse = require('./parse')
const error = require('./error')
const help = require('./help')

module.exports = function sergeant (name, description, define) {
  if (define == null) {
    define = description

    description = null
  }

  const options = []
  const parameters = []
  const commands = []

  option('help', {
    aliases: ['h'],
    description: 'get help'
  })

  const action = define({option, parameter, command})

  return function (argv) {
    const filtered = argv.filter((arg) => arg !== '-' && !arg.startsWith('-'))
    const command = commands.find((command) => command.name === filtered[0])

    if (filtered[0] != null && command != null) {
      const index0 = argv.indexOf(filtered[0])

      argv.splice(index0, 1)

      command.action(argv)
    } else {
      const args = parse(argv, {options, parameters})

      try {
        if (args != null) {
          if (args.help === true || action == null) {
            help(name, description, {options, parameters, commands})
          } else if (action != null) {
            const result = action(args)

            if (typeof result === 'object' && result instanceof Promise) {
              result.catch(error)
            }
          }
        }
      } catch (e) {
        error(e)
      }
    }
  }

  function command (subname, description, define) {
    if (define == null) {
      define = description

      description = null
    }

    commands.push({
      name: subname,
      action: sergeant(name + ' ' + subname, description, define),
      description
    })
  }

  function option (key, definition) {
    options.push(Object.assign(definition, {key}))
  }

  function parameter (key, definition) {
    parameters.push(Object.assign(definition, {key}))
  }
}
