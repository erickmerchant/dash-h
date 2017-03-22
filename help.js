const chalk = require('chalk')
const console = require('./globals').console
const process = require('./globals').process

module.exports = function (name, definitions) {
  definitions = Object.assign({}, definitions)

  process.exitCode = 1

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

  console.error(chalk.green('Usage:') + ' ' + name + ' [options] ' + parameterKeys.map((key) => definitions[key].signature).join(' '))

  console.error('')

  if (parameterKeys.length) {
    console.error(chalk.green('Parameters:'))

    console.error('')

    const longestParameter = parameterKeys.reduce((longest, key) => {
      const definition = definitions[key]

      return definition.signature.length > longest ? definition.signature.length : longest
    }, 0)

    parameterKeys.forEach((key) => {
      const definition = definitions[key]

      const details = describe(definition)

      console.error(' '.repeat(longestParameter - definition.signature.length) + definition.signature + '  ' + details)
    })

    console.error('')
  }

  const optionKeys = Object.keys(definitions).filter((key) => Number.isInteger(Number(key)) === false)

  if (optionKeys.length) {
    console.error(chalk.green('Options:'))

    console.error('')

    const longestOption = optionKeys.reduce((longest, key) => {
      const definition = definitions[key]

      return definition.signature.length > longest ? definition.signature.length : longest
    }, 0) + 1

    optionKeys.forEach((key) => {
      const definition = definitions[key]

      const details = describe(definition)

      console.error(' '.repeat(longestOption - definition.signature.length) + definition.signature + '  ' + details)
    })

    console.error('')
  }
}

function describe (definition) {
  let details = []

  if (definition.description != null) {
    details.push(definition.description)
  }

  if (definition.default != null) {
    details.push('Default: ' + definition.default)
  }

  if (definition.type != null && definition.type.name != null) {
    details.push('Type: ' + definition.type.name)
  }

  if (definition.required === true) {
    details.push('Required')
  }

  if (definition.multiple === true) {
    details.push('Multiple')
  }

  return chalk.gray(details.join('. '))
}
