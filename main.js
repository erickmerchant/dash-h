const parse = require('./parse.js')
const error = require('./error.js')
const help = require('./help.js')
const helpOption = {
  name: 'help',
  alias: 'h',
  description: 'get help'
}

module.exports = (name) => {
  const commands = []

  return {
    command(command, define) {
      if (define == null) {
        define = command

        command = []
      }

      const options = []
      const parameters = []
      let description = ''

      const action = define({
        parameter(parameter) {
          parameters.push(parameter)
        },
        option(option) {
          options.push(option)
        },
        description(desc) {
          description = desc
        }
      })

      options.push(helpOption)

      commands.push({
        command,
        description,
        parameters,
        options,
        action
      })
    },
    async start(argv) {
      const command = commands.reduce((acc, command) => {
        if (acc != null) return acc

        if (command.command.reduce((acc, val, index) => (argv[index] != null && val === argv[index] ? acc + 1 : acc), 0) === command.command.length) {
          return command
        }

        return acc
      }, null)

      if (command != null) {
        const args = parse(argv.slice(command.command.length), {options: command.options, parameters: command.parameters})

        try {
          if (args != null) {
            if (args.help === true || command.action == null) {
              help([name].concat(command.command), command.description, {commands: [], options: command.options, parameters: command.parameters})
            } else if (command.action != null) {
              await command.action(args)
            }
          }
        } catch (e) {
          error(e)
        }
      } else {
        const rootCommand = commands.find((command) => !command.command.length)

        help([name], rootCommand ? rootCommand.description : '', {commands, options:  rootCommand ? rootCommand.options : [helpOption], parameters: rootCommand ? rootCommand.parameters : []})
      }
    }
  }
}
