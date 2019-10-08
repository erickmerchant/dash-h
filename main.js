const parse = require('./parse.js')
const error = require('./error.js')
const help = require('./help.js')
const helpOptions = {
  help: {
    description: 'get help'
  },
  h: 'help'
}
const defaultOption = {
  description: '',
  multiple: false,
  required: false,
  parameter: false,
  default: null
}
const defaultCommand = {
  name: '',
  description: '',
  signature: [],
  options: helpOptions,
  action: null
}

module.exports = (prefix) => {
  const commands = []

  return {
    command(definition) {
      definition = {...defaultCommand, ...definition}

      definition.options = {...definition.options, ...helpOptions}

      for (const key of Object.keys(definition.options)) {
        const option = definition.options[key]

        if (typeof option !== 'object') continue

        definition.options[key] = {...defaultOption, ...option}
      }

      commands.unshift(definition)
    },
    async start(argv) {
      let command = commands.reduce((acc, command) => {
        if (acc != null && acc.name !== '') return acc

        if (command.name === argv[0] || command.name === '') {
          return command
        }

        return acc
      }, null)

      if (command == null) {
        command = defaultCommand
      }

      const subCommands = command.name === '' ? commands : []

      try {
        const args = parse(argv.slice(1), {signature: command.signature, options: command.options})

        if (args == null || args.help === true || command.action == null) {
          help(prefix, {commands: subCommands, name: command.name, description: command.description, signature: command.signature, options: command.options})
        } else if (command.action != null) {
          await command.action(args)
        }
      } catch (e) {
        error(e)
      }
    }
  }
}
