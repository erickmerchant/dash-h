const chalk = require('chalk')
const console = require('./globals').console
const process = require('./globals').process

module.exports = function (name, description, definitions, commands = {}) {
  definitions = Object.assign({}, definitions)

  process.exitCode = 1

  if (description) {
    console.error('')

    console.error(description)
  }

  Object.keys(definitions).forEach(function (key) {
    const definition = definitions[key]
    const k = definition.key != null ? definition.key : key

    if (Number.isInteger(Number(key))) {
      definition.signature = k
    } else {
      definition.signature = (k.length === 1 ? '-' : '--') + k

      if (definition.aliases != null && definition.aliases.length) {
        definition.signature += ',' + definition.aliases.map((k) => (k.length === 1 ? '-' : '--') + k).join(',')
      }
    }
  })

  const parameterKeys = Object.keys(definitions).filter((key) => Number.isInteger(Number(key)))

  const optionKeys = Object.keys(definitions).filter((key) => Number.isInteger(Number(key)) === false)

  if (parameterKeys.length || optionKeys.length) {
    let usage = [name]

    if (optionKeys.length) {
      usage = usage.concat(optionKeys.map((key) => {
        const definition = definitions[key]

        return (definition.required !== true ? '[' : '') + definition.signature + (definition.type !== Boolean ? '=' + '<' + (definition.type ? definition.type.name : key) + '>' : '') + (definition.multiple === true ? '...' : '') + (definition.required !== true ? ']' : '')
      }))
    }

    if (parameterKeys.length) {
      usage = usage.concat(parameterKeys.map((key) => {
        const definition = definitions[key]

        return (definition.required !== true ? '[' : '') + '<' + definition.signature + '>' + (definition.multiple === true ? '...' : '') + (definition.required !== true ? ']' : '')
      }))
    }

    console.error('')

    if (Object.keys(commands).length) {
      console.error(chalk.green('Usage:'))

      console.error('')

      console.error(usage.join(' '))

      console.error(name + ' <command> [--help,-h]')
    } else {
      console.error(chalk.green('Usage:') + ' ' + usage.join(' '))
    }
  }

  if (parameterKeys.length) {
    console.error('')

    console.error(chalk.green('Parameters:'))

    console.error('')

    const longestParameter = parameterKeys.reduce((longest, key) => {
      const definition = definitions[key]

      return definition.signature.length > longest ? definition.signature.length : longest
    }, 0)

    parameterKeys.forEach((key) => {
      const definition = definitions[key]
      const description = [' '.repeat(longestParameter - definition.signature.length) + definition.signature]

      if (definition.description) {
        description.push(chalk.gray(definition.description))
      }

      if (definition.default) {
        description.push('[default: ' + (typeof definition.default === 'string' ? '"' : '') + definition.default + (typeof definition.default === 'string' ? '"' : '') + ']')
      }

      console.error(description.join('  '))
    })
  }

  if (optionKeys.length) {
    console.error('')

    console.error(chalk.green('Options:'))

    console.error('')

    const longestOption = optionKeys.reduce((longest, key) => {
      const definition = definitions[key]

      return definition.signature.length > longest ? definition.signature.length : longest
    }, 0) + 1

    optionKeys.forEach((key) => {
      const definition = definitions[key]
      const description = [' '.repeat(longestOption - definition.signature.length) + definition.signature]

      if (definition.description) {
        description.push(chalk.gray(definition.description))
      }

      if (definition.default) {
        description.push('[default: ' + (typeof definition.default === 'string' ? '"' : '') + definition.default + (typeof definition.default === 'string' ? '"' : '') + ']')
      }

      console.error(description.join('  '))
    })
  }

  const commandKeys = Object.keys(commands)

  if (commandKeys.length) {
    const longestCommand = commandKeys.reduce((longest, key) => {
      return key.length > longest ? key.length : longest
    }, 0)

    console.error('')

    console.error(chalk.green('Commands:'))

    console.error('')

    commandKeys.forEach((key) => {
      const command = commands[key]

      console.error(key + (command.description ? '  ' + ' '.repeat(longestCommand - key.length) + chalk.gray(command.description != null ? command.description : '') : ''))
    })
  }
}
