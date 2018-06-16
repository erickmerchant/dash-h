const parse = require('./parse')
const error = require('./error')
const help = require('./help')
const assert = require('assert')

module.exports = function sergeant (name, description, define, parent = {}) {
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

  const option = getAppender('options')

  const parameter = getAppender('parameters')

  option('help', {
    aliases: ['h'],
    description: 'get help'
  })

  const action = define({option, parameter, command})

  return cli

  function command (subname, description, define) {
    if (define == null) {
      define = description

      description = null
    }

    cli.commands.push({
      name: subname,
      action: sergeant(name + ' ' + subname, description, define, cli),
      description
    })
  }

  function getAppender (id) {
    return function (key, definition) {
      const current = Object.assign(definition, {key})

      if (parent[id] != null) {
        const prev = parent[id].find((option) => option.key === key)

        if (prev != null) {
          assert.deepStrictEqual(current, prev, 'the defintion of ' + key + ' can not be changed')
        }
      }

      cli[id].push(current)
    }
  }
}
