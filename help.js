const chalk = require('chalk')
const { console, process } = require('./src/globals')
const { addDashes, longest, spaces } = require('./src/helpers')

module.exports = function (title, description, { options, parameters, commands }) {
  process.exitCode = 1

  if (description) {
    console.error('')

    console.error(description)
  }

  console.error('')

  console.error(chalk.green('Usage:') + ' ' + getUsage(title, { options, parameters }))

  const longestArg = longest(
    parameters.map(function (definition) {
      return '<' + definition.key + '>'
    })
      .concat(
        options.map(function (definition) {
          return getOptionSignature(definition)
        })
      )
  )

  if (parameters.length) {
    console.error('')

    console.error(chalk.green('Parameters:'))

    console.error('')

    for (const definition of parameters) {
      let line = '<' + definition.key + '>' + spaces(longestArg - definition.key.length - 2) + '  '

      if (definition.description) {
        line += definition.description + ' '
      }

      if (definition.type != null) {
        const _default = definition.type()

        if (_default != null) {
          line += '[default: ' + JSON.stringify(_default) + ']'
        }
      }

      console.error(line.trim())
    }
  }

  if (options.length) {
    console.error('')

    console.error(chalk.green('Options:'))

    console.error('')

    for (const definition of options) {
      const signature = getOptionSignature(definition)
      let line = signature + spaces(longestArg - signature.length) + '  '

      if (definition.description) {
        line += definition.description + ' '
      }

      if (definition.type != null) {
        const _default = definition.type()

        if (_default != null) {
          line += '[default: ' + JSON.stringify(_default) + ']'
        }
      }

      console.error(line.trim())
    }
  }

  if (commands.length) {
    console.error('')

    console.error(chalk.green('Commands:'))

    commandList(title, commands)
  }

  console.error('')
}

function getUsage (title, { options, parameters }) {
  let usage = [title]

  if (options && options.length) {
    usage = usage.concat(options.map(function (definition) {
      const valPart = definition.type != null
        ? ' <' + definition.key + '>'
        : ''

      return wrapUsage(addDashes(definition.alias != null ? definition.alias : definition.key) + valPart, definition)
    }))
  }

  if (parameters && parameters.length) {
    usage = usage.concat(parameters.map(function (definition) {
      return wrapUsage('<' + definition.key + '>', definition)
    }))
  }

  return usage.join(' ')
}

function wrapUsage (usage, { required, multiple }) {
  const opt = usage.startsWith('-')

  return (required !== true ? '[' : (opt ? '(' : '')) + usage + (required !== true ? ']' : (opt ? ')' : '')) + (multiple === true ? '...' : '')
}

function getOptionSignature (definition) {
  let val = definition.type != null
    ? ' <' + definition.key + '>'
    : ''
  let signature = addDashes(definition.key) + val

  if (definition.alias != null) {
    signature = addDashes(definition.alias) + val + ', ' + signature
  }

  return signature
}

function commandList (title, commands) {
  for (const command of commands) {
    console.error('')

    console.error(getUsage(title + ' ' + command.title, command))

    if (command.description) {
      console.error('')

      console.error('  ' + command.description)
    }

    commandList(title + ' ' + command.title, command.commands)
  }
}
