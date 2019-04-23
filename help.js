const {green} = require('kleur')
const {console, process} = require('./src/globals.js')
const {addDashes, longest, spaces} = require('./src/helpers.js')

const getUsage = (title, {options, parameters}) => {
  const usage = ['', title]

  if (options && options.length) {
    usage.push(...options.map((definition) => {
      const valPart = definition.type != null
        ? ` <${definition.name}>`
        : ''

      return wrapUsage(addDashes(definition.alias != null ? definition.alias : definition.name) + valPart, definition)
    }))
  }

  if (parameters && parameters.length) {
    usage.push(...parameters.map((definition) => wrapUsage(`<${definition.name}>`, definition)))
  }

  return usage.join(' ')
}

const wrapUsage = (usage, {required, multiple}) => {
  const opt = usage.startsWith('-')

  let result = usage

  if (!required) {
    result = `[${result}]`
  } else if (opt) {
    result = `(${result})`
  }

  return multiple === true ? `${result}...` : result
}

const getOptionSignature = (definition) => {
  const val = definition.type != null
    ? ` <${definition.name}>`
    : ''
  let signature = addDashes(definition.name) + val

  if (definition.alias != null) {
    signature = `${addDashes(definition.alias)}, ${signature}`
  }

  return signature
}

const commandList = (commands) => {
  const lines = []

  for (const command of commands) {
    lines.push(getUsage(`${command.command.join(' ')}`, command))
  }

  return lines
}

module.exports = (title, description, {options, parameters, commands}) => {
  process.exitCode = 1
  const lines = []

  if (description) {
    const trimmedDescription = description.trim()
    const lineCount = trimmedDescription.split('\n').length

    if (lineCount > 1) {
      lines.push('', green('Description:'), '', trimmedDescription)
    } else {
      lines.push('', `${green('Description:')} ${trimmedDescription}`)
    }
  }

  lines.push('', `${green('Usage:')}${getUsage(title.join(' '), {options, parameters})}`)

  const longestArg = longest([
    ...parameters.map((definition) => `<${definition.name}>`),
    ...options.map((definition) => getOptionSignature(definition))
  ])

  if (parameters.length) {
    lines.push('', green('Parameters:'), '')

    for (const definition of parameters) {
      let line = ` <${definition.name}>${spaces(longestArg - definition.name.length - 2)}  `

      if (definition.description) {
        line += `${definition.description} `
      }

      if (definition.type != null) {
        const _default = definition.type()

        if (_default != null) {
          line += `[default: ${JSON.stringify(_default)}]`
        }
      }

      lines.push(line.trimRight())
    }
  }

  if (options.length) {
    lines.push('', green('Options:'), '')

    for (const definition of options) {
      const signature = getOptionSignature(definition)
      let line = ` ${signature + spaces(longestArg - signature.length)}  `

      if (definition.description) {
        line += `${definition.description} `
      }

      if (definition.type != null) {
        const _default = definition.type()

        if (_default != null) {
          line += `[default: ${JSON.stringify(_default)}]`
        }
      }

      lines.push(line.trimRight())
    }
  }

  if (commands.length) {
    lines.push('', green('Commands:'), '', ...commandList(commands))
  }

  lines.push('')

  console.log(lines.join('\n'))
}
