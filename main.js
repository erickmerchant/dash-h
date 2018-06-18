const parse = require('./parse')
const error = require('./error')
const help = require('./help')
// const assert = require('assert')

module.exports = function sergeant (name, description, define) {
  if (define == null) {
    define = description

    description = null
  }

  function cli (argv) {
    const filtered = argv.filter((arg) => arg !== '-' && !arg.startsWith('-'))
    const command = cli.commands.find((command) => command.name === filtered[0])

    if (filtered[0] != null && command != null) {
      const index0 = argv.indexOf(filtered[0])

      argv.splice(index0, 1)

      command.action(argv)
    } else {
      const args = parse(argv, {options: cli.options, parameters: cli.parameters})

      try {
        if (args != null) {
          if (args.help === true || action == null) {
            help(name, description, {options: cli.options, parameters: cli.parameters, commands: cli.commands})
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

  cli.name = name

  cli.options = []

  cli.parameters = []

  cli.commands = []

  const action = define({option, parameter, command})

  option('help', {
    aliases: ['h'],
    description: 'get help'
  })

  return cli

  function command (subname, description, define) {
    if (define == null) {
      define = description

      description = null
    }

    cli.commands.push({
      name: subname,
      action: sergeant(name + ' ' + subname, description, define),
      description
    })
  }

  function option (key, definition) {
    const current = Object.assign(definition, {key})

    cli.options.push(current)
  }

  function parameter (key, definition) {
    const current = Object.assign(definition, {key})

    cli.parameters.push(current)
  }
}
