const parse = require('./parse.js')
const error = require('./error.js')
const help = require('./help.js')
// const assert = require('assert')

const sergeant = (path, description, define) => {
  const title = path.split(' ').reverse()[0]

  if (define == null) {
    define = description

    description = null
  }

  const cli = (argv) => {
    const filtered = argv.filter((arg) => arg !== '-' && !arg.startsWith('-'))
    const command = cli.commands.find((command) => command.title === filtered[0])

    if (filtered[0] != null && command != null) {
      const index0 = argv.indexOf(filtered[0])

      argv.splice(index0, 1)

      command(argv)
    } else {
      const args = parse(argv, {options: cli.options, parameters: cli.parameters})

      try {
        if (args != null) {
          if (args.help === true || action == null) {
            help(path, description, {options: cli.options, parameters: cli.parameters, commands: cli.commands})
          } else if (action != null) {
            Promise.resolve()
              .then(() => action(args))
              .catch(error)
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

  const command = (subtitle, description, define) => {
    if (define == null) {
      define = description

      description = null
    }

    cli.commands.push(sergeant(`${path} ${subtitle}`, description, define))
  }

  const option = (key, definition) => {
    const current = Object.assign(definition, {key})

    cli.options.push(current)
  }

  const parameter = (key, definition) => {
    const current = Object.assign(definition, {key})

    cli.parameters.push(current)
  }

  const action = define({option, parameter, command})

  option('help', {
    alias: 'h',
    description: 'get help'
  })

  return cli
}

module.exports = sergeant
