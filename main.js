const parse = require('./parse')
const error = require('./error')
const help = require('./help')

module.exports = function sergeant (name, description, define) {
  if (define == null) {
    define = description

    description = null
  }

  const definitions = {}
  const commands = {}

  option('help', {
    type: Boolean,
    aliases: ['h'],
    description: 'get help'
  })

  let i = 0
  const action = define({option, parameter, command})

  return (argv) => {
    const filtered = argv.filter((arg) => arg !== '-' && !arg.startsWith('-'))

    if (filtered[0] != null && commands[filtered[0]] != null) {
      const index0 = argv.indexOf(filtered[0])

      argv.splice(index0, 1)

      commands[filtered[0]].action(argv)
    } else {
      const args = parse(argv, definitions)

      try {
        if (args != null) {
          if (args.help === true || action == null) {
            help(name, description, definitions, commands)
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

    commands[subname] = {
      action: sergeant(name + ' ' + subname, description, define),
      description
    }
  }

  function option (key, definition) {
    definitions[key] = getDefinition(key, definition)
  }

  function parameter (key, definition) {
    definitions[i++] = getDefinition(key, definition)
  }

  function getDefinition (key, definition) {
    definition = Object.assign(definition, {key})

    if (definition.default) {
      if (definition.multiple && !Array.isArray(definition.default)) {
        throw new Error('the default of ' + key + ' should be an array')
      }

      if (!definition.multiple && Array.isArray(definition.default)) {
        throw new Error('the default of ' + key + ' should not be an array')
      }
    }

    if (definition.type != null && definition.type === Boolean) {
      if (definition.default != null) {
        if (definition.default !== false) {
          throw new Error('the default of ' + key + ' should be false')
        }
      }
    }

    return definition
  }
}
