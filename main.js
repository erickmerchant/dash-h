const parse = require('./parse.js')
const error = require('./error.js')
const help = require('./help.js')
const helpOption = {
  name: 'help',
  alias: 'h',
  description: 'get help'
}
const defaultRootCommand = {
  command: [],
  description: '',
  parameters: [],
  options: [
    helpOption
  ]
}
const commandMatches = (a, b) => a.reduce((acc, val, index) => (b[index] != null && val === b[index] ? acc + 1 : acc), 0) === a.length

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

      commands.unshift({
        command,
        description,
        parameters,
        options,
        action
      })
    },
    async start(argv) {
      let command = commands.reduce((acc, command) => {
        if (acc != null) return acc

        if (commandMatches(command.command, argv)) {
          return command
        }

        return acc
      }, null)

      if (command == null) {
        command = defaultRootCommand
      }

      const subCommands = commands.filter((sub) => {
        if (sub !== command && commandMatches(command.command, sub.command)) {
          return true
        }

        return false
      }, []).reverse()

      try {
        const args = parse(argv.slice(command.command.length), {options: command.options, parameters: command.parameters})

        if (args == null || args.help === true || command.action == null) {
          help(name, command.command, command.description, {commands: subCommands, options: command.options, parameters: command.parameters})
        } else if (command.action != null) {
          await command.action(args)
        }
      } catch (e) {
        error(e)
      }
    }
  }
}
