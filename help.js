const {green} = require('kleur')
const {console, process} = require('./src/globals.js')
const {addDashes, spaces, resolveProperty} = require('./src/helpers.js')

const getUsage = (prefix, command) => {
  const usage = ['', `${prefix} ${command.name}`]

  if (command.options) {
    usage.push(...Object.keys(command.options).map((key) => {
      const definition = command.options[key]

      if (typeof definition !== 'object' || !definition.required || command.signature.reduce((acc, k) => (acc ? acc : resolveProperty(command.options, k) === key), false)) {
        return null
      }

      const valPart = definition.parameter
        ? ` <${key}>`
        : ''

      return wrapUsage(addDashes(key) + valPart, definition)
    }).filter((result) => result != null))
  }

  if (command.signature.length) {
    usage.push(...command.signature.map((key) => {
      const property = resolveProperty(command.options, key)
      const definition = command.options[property]

      return wrapUsage(`<${key}>`, definition)
    }))
  }

  return usage.join(' ')
}

const wrapUsage = (usage, {required, multiple}) => {
  let result = usage

  if (!required) {
    result = `[${result}]`
  }

  return multiple === true ? `${result}...` : result
}

const getOptionUsage = (property, {options, signature}) => {
  const definition = options[property]

  const val = definition.parameter
    ? ` <${property}>`
    : ''
  let usage = (signature.reduce((acc, k) => (acc ? acc : resolveProperty(options, k) === property), false) ? `[${addDashes(property)}]` : addDashes(property)) + val

  for (const alias of Object.keys(options)) {
    if (options[alias] !== property) continue

    usage = `${signature.reduce((acc, k) => (acc ? acc : resolveProperty(options, k) === property), false) ? `[${addDashes(alias)}]` : addDashes(alias)}, ${usage}`
  }

  return usage
}

const commandList = (prefix, commands) => {
  const lines = []

  for (const command of commands) {
    lines.push(getUsage(prefix, command))
  }

  return lines
}

module.exports = (prefix, {description, name, signature, options, commands}) => {
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

  lines.push('', `${green('Usage:')}${getUsage(prefix, {name, signature, options})}`)

  if (Object.keys(options).length) {
    lines.push('', green('Options:'), '')

    const optionLines = []
    let longest = 0

    for (const key of Object.keys(options)) {
      const property = resolveProperty(options, key)

      if (property !== key) continue

      const definition = options[property]

      const usage = getOptionUsage(property, {options, signature})

      if (usage.length > longest) {
        longest = usage.length
      }

      const line = [usage]

      if (definition.description) {
        line.push(`${definition.description} `)
      }

      if (definition.parameter) {
        if (definition.default != null) {
          line.push(`[default: ${JSON.stringify(definition.default)}]`)
        }
      }

      optionLines.push(line)
    }

    for (const optionLine of optionLines) {
      lines.push(` ${optionLine[0]}  ${spaces(longest - optionLine[0].length)}${optionLine.slice(1).join('').trim()}`)
    }
  }

  if (commands.length) {
    lines.push('', green('Commands:'), '', ...commandList(prefix, commands))
  }

  lines.push('')

  console.log(lines.join('\n'))
}
