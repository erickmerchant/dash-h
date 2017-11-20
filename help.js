const chalk = require('chalk')
const { console, process } = require('./src/globals')
const { isNumber, addDashes, longest, spaces, quoteString } = require('./src/helpers')

module.exports = function (name, description, definitions, commands = {}) {
  definitions = Object.assign({}, definitions)

  process.exitCode = 1

  if (description) {
    console.error('')

    console.error(description)
  }

  Object.keys(definitions).forEach(function (key) {
    const definition = definitions[key]

    if (isNumber(key)) {
      definition.signature = definition.key
    } else {
      definition.signature = addDashes(definition.key)

      if (definition.aliases != null && definition.aliases.length) {
        definition.signature += ',' + definition.aliases.map((k) => addDashes(k)).join(',')
      }
    }
  })

  const parameterKeys = Object.keys(definitions).filter((key) => isNumber(key))

  const optionKeys = Object.keys(definitions).filter((key) => isNumber(key) === false)

  if (parameterKeys.length || optionKeys.length) {
    let usage = [name]

    if (optionKeys.length) {
      usage = usage.concat(optionKeys.map((key) => {
        const definition = definitions[key]
        const valPart = definition.type !== Boolean
          ? '=' + '<' + (definition.type ? definition.type.name : key) + '>'
          : ''

        return wrapUsage(definition.signature + valPart, definition)
      }))
    }

    if (parameterKeys.length) {
      usage = usage.concat(parameterKeys.map((key) => {
        const definition = definitions[key]

        return wrapUsage('<' + definition.signature + '>', definition)
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

    const longestParameter = longest(parameterKeys.map((key) => {
      return definitions[key].signature
    }))

    parameterKeys.forEach((key) => {
      const definition = definitions[key]
      const description = [spaces(longestParameter - definition.signature.length) + definition.signature]

      if (definition.description) {
        description.push(chalk.gray(definition.description))
      }

      if (definition.default) {
        description.push('[default: ' + quoteString(definition.default) + ']')
      }

      console.error(description.join('  '))
    })
  }

  if (optionKeys.length) {
    console.error('')

    console.error(chalk.green('Options:'))

    console.error('')

    const longestOption = longest(optionKeys.map((key) => {
      return definitions[key].signature
    })) + 1

    optionKeys.forEach((key) => {
      const definition = definitions[key]
      const description = [spaces(longestOption - definition.signature.length) + definition.signature]

      if (definition.description) {
        description.push(chalk.gray(definition.description))
      }

      if (definition.default) {
        description.push('[default: ' + quoteString(definition.default) + ']')
      }

      console.error(description.join('  '))
    })
  }

  const commandKeys = Object.keys(commands)

  if (commandKeys.length) {
    const longestCommand = longest(commandKeys)

    console.error('')

    console.error(chalk.green('Commands:'))

    console.error('')

    commandKeys.forEach((key) => {
      const command = commands[key]

      console.error(key + (command.description ? '  ' + spaces(longestCommand - key.length) + chalk.gray(command.description != null ? command.description : '') : ''))
    })
  }

  console.error('')
}

function wrapUsage (usage, {required, multiple}) {
  return (required !== true ? '[' : '') + usage + (multiple === true ? '...' : '') + (required !== true ? ']' : '')
}
