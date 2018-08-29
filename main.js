const parse = require('./parse')
const error = require('./error')
const help = require('./help')
// const assert = require('assert')

module.exports = function sergeant (path, description, define) {
  const title = path.split(' ').reverse()[0]

  if (define == null) {
    define = description

    description = null
  }

  function cli (argv) {
    const filtered = argv.filter((arg) => arg !== '-' && !arg.startsWith('-'))
    const command = cli.commands.find((command) => command.title === filtered[0])

    if (filtered[0] != null && command != null) {
      const index0 = argv.indexOf(filtered[0])

      argv.splice(index0, 1)

      command(argv)
    } else {
      const args = parse(argv, { options: cli.options, parameters: cli.parameters })

      try {
        if (args != null) {
          if (args.help === true || action == null) {
            help(path, description, { options: cli.options, parameters: cli.parameters, commands: cli.commands })
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

  cli.title = title

  cli.description = description

  cli.options = []

  cli.parameters = []

  cli.commands = []

  const action = define({ option, parameter, command })

  option('help', {
    alias: 'h',
    description: 'get help'
  })

  return cli

  function command (subtitle, description, define) {
    if (define == null) {
      define = description

      description = null
    }

    cli.commands.push(sergeant(path.split(' ').concat([ subtitle ]).join(' '), description, define))
  }

  function option (key, definition) {
    const current = Object.assign(definition, { key })

    cli.options.push(current)
  }

  function parameter (key, definition) {
    const current = Object.assign(definition, { key })

    cli.parameters.push(current)
  }
}
