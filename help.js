const chalk = require('chalk')
const { console, process } = require('./src/globals')
const { addDashes, longest, spaces, quoteString } = require('./src/helpers')

module.exports = function (name, description, {options, parameters, commands}) {
  process.exitCode = 1

  if (description) {
    console.error('')

    console.error(description)
  }

  if (parameters.length || options.length) {
    let usage = [name]

    if (options.length) {
      usage = usage.concat(options.map((definition) => {
        const valPart = definition.type !== Boolean
          ? '=<' + (definition.type ? definition.type.name : 'String') + '>'
          : ''

        return wrapUsage(getSignature(definition) + valPart, definition)
      }))
    }

    if (parameters.length) {
      usage = usage.concat(parameters.map((definition) => {
        return wrapUsage('<' + definition.key + '>', definition)
      }))
    }

    console.error('')

    if (commands.length) {
      console.error(chalk.green('Usage:'))

      console.error('')

      console.error(usage.join(' '))

      console.error(name + ' <command> [--help,-h]')
    } else {
      console.error(chalk.green('Usage:') + ' ' + usage.join(' '))
    }
  }

  if (parameters.length) {
    console.error('')

    console.error(chalk.green('Parameters:'))

    console.error('')

    const longestParameter = longest(parameters.map((definition) => {
      return definition.key
    }))

    parameters.forEach((definition) => {
      const description = [spaces(longestParameter - definition.key.length) + definition.key]

      if (definition.description) {
        description.push(chalk.gray(definition.description))
      }

      if (definition.default) {
        description.push('[default: ' + quoteString(definition.default) + ']')
      }

      console.error(description.join('  '))
    })
  }

  if (options.length) {
    console.error('')

    console.error(chalk.green('Options:'))

    console.error('')

    const longestOption = longest(options.map((definition) => {
      return getSignature(definition)
    })) + 1

    options.forEach((definition) => {
      const signature = getSignature(definition)
      const description = [spaces(longestOption - signature.length) + signature]

      if (definition.description) {
        description.push(chalk.gray(definition.description))
      }

      if (definition.default) {
        description.push('[default: ' + quoteString(definition.default) + ']')
      }

      console.error(description.join('  '))
    })
  }

  if (commands.length) {
    const longestCommand = longest(commands.map((command) => command.name))

    console.error('')

    console.error(chalk.green('Commands:'))

    console.error('')

    commands.forEach((command) => {
      console.error(command.name + (command.description ? '  ' + spaces(longestCommand - command.name.length) + chalk.gray(command.description != null ? command.description : '') : ''))
    })
  }

  console.error('')
}

function wrapUsage (usage, {required, multiple}) {
  return (required !== true ? '[' : '') + usage + (multiple === true ? '...' : '') + (required !== true ? ']' : '')
}

function getSignature (definition) {
  let signature = addDashes(definition.key)

  if (definition.aliases != null && definition.aliases.length) {
    signature += ',' + definition.aliases.map((k) => addDashes(k)).join(',')
  }

  return signature
}
