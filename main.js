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
      let command

      for (const definition of commands) {
        if (definition.name === argv[0] || definition.name === '') {
          command = definition

          if (command.name !== '') {
            break
          }
        }
      }

      if (command == null) {
        command = defaultCommand
      }

      const subCommands = command.name === '' ? commands : []

      try {
        const args = parse(command.name === '' ? argv : argv.slice(1), {signature: command.signature, options: command.options})

        if (args == null || args.help || command.action == null) {
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
