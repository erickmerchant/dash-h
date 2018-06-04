const chalk = require('chalk')
const { console, process } = require('./src/globals')
const { addDashes, longest, spaces } = require('./src/helpers')

module.exports = function (name, description, {options, parameters, commands}) {
  process.exitCode = 1

  if (description) {
    console.error('')

    console.error(description)
  }

  if (parameters.length || options.length) {
    let usage = [name]

    if (options.length) {
      usage = usage.concat(options.map(function (definition) {
        const valPart = definition.type != null
          ? ' <' + definition.type.name + '>'
          : ''

        return wrapUsage(addDashes(definition.key) + valPart, definition)
      }))
    }

    if (parameters.length) {
      usage = usage.concat(parameters.map(function (definition) {
        return wrapUsage('<' + definition.key + '>', definition)
      }))
    }

    console.error('')

    if (commands.length) {
      console.error(chalk.green('Usage:'))

      console.error('')

      console.error(usage.join(' '))

      console.error(name + ' <command> [--help]')
    } else {
      console.error(chalk.green('Usage:') + ' ' + usage.join(' '))
    }
  }

  if (parameters.length) {
    console.error('')

    console.error(chalk.green('Parameters:'))

    console.error('')

    const longestParameter = longest(parameters.map(function (definition) {
      return definition.key
    }))

    for (let definition of parameters) {
      const description = [spaces(longestParameter - definition.key.length) + definition.key]

      if (definition.description) {
        description.push(chalk.gray(definition.description))
      }

      if (definition.type != null) {
        const _default = definition.type()

        if (_default != null) {
          description.push('[default: ' + JSON.stringify(_default) + ']')
        }
      }

      console.error(description.join('  '))
    }
  }

  if (options.length) {
    console.error('')

    console.error(chalk.green('Options:'))

    console.error('')

    const longestOption = longest(options.map(function (definition) {
      return getSignature(definition)
    }))

    for (let definition of options) {
      const signature = getSignature(definition)
      const description = [spaces(longestOption - signature.length) + signature]

      if (definition.description) {
        description.push(chalk.gray(definition.description))
      }

      if (definition.type != null) {
        const _default = definition.type()

        if (_default != null) {
          description.push('[default: ' + JSON.stringify(_default) + ']')
        }
      }

      console.error(description.join('  '))
    }
  }

  if (commands.length) {
    const longestCommand = longest(commands.map((command) => command.name))

    console.error('')

    console.error(chalk.green('Commands:'))

    console.error('')

    for (let command of commands) {
      console.error(command.name + (command.description ? '  ' + spaces(longestCommand - command.name.length) + chalk.gray(command.description != null ? command.description : '') : ''))
    }
  }

  console.error('')
}

function wrapUsage (usage, {required, multiple}) {
  const opt = usage.startsWith('-')

  return (required !== true ? '[' : (opt ? '(' : '')) + usage + (required !== true ? ']' : (opt ? ')' : '')) + (multiple === true ? '...' : '')
}

function getSignature (definition) {
  let signature = addDashes(definition.key)

  if (definition.aliases != null && definition.aliases.length) {
    signature = definition.aliases.map((k) => addDashes(k)).join(', ') + ', ' + signature
  }

  return signature
}
