const {green} = require('kleur')
const {console, process} = require('./src/globals.js')
const {addDashes, resolveProperty} = require('./src/helpers.js')

const getUsage = (prefix, command) => {
  const usage = ['', `${prefix} ${command.name}`]
  const resolvedSignature = command.signature.map((key) => resolveProperty(command.options, key))

  for (const [key, definition] of Object.entries(command.options)) {
    if (typeof definition !== 'object' || !definition.required || resolvedSignature.includes(key)) {
      continue
    }

    const valPart = definition.parameter
      ? ` <${key}>`
      : ''

    usage.push(wrapUsage(addDashes(key) + valPart, definition))
  }

  for (const key of command.signature) {
    const property = resolveProperty(command.options, key)
    const definition = command.options[property]

    usage.push(wrapUsage(`<${key}>`, definition))
  }

  return usage.join(' ')
}

const wrapUsage = (usage, {required, multiple}) => {
  let result = usage

  if (!required) {
    result = `[${result}]`
  }

  return multiple ? `${result}...` : result
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
    const resolvedSignature = signature.map((key) => resolveProperty(options, key))

    for (const [key, definition] of Object.entries(options)) {
      const property = resolveProperty(options, key)

      if (property !== key) continue

      const inSignature = resolvedSignature.includes(property)

      const val = definition.parameter
        ? ` <${property}>`
        : ''
      let usage = (inSignature ? `[${addDashes(property)}]` : addDashes(property)) + val

      for (const [key, alias] of Object.entries(options)) {
        if (alias !== property) continue

        usage = `${inSignature ? `[${addDashes(key)}]` : addDashes(key)}, ${usage}`
      }

      if (usage.length > longest) {
        longest = usage.length
      }

      const line = [usage]

      if (definition.description) {
        line.push(`${definition.description} `)
      }

      if (definition.parameter && definition.default != null) {
        line.push(`[default: ${JSON.stringify(definition.default)}]`)
      }

      optionLines.push(line)
    }

    for (const optionLine of optionLines) {
      lines.push(` ${optionLine[0]}  ${' '.repeat(longest - optionLine[0].length)}${optionLine.slice(1).join('').trim()}`)
    }
  }

  if (commands.length) {
    lines.push('', green('Commands:'), '')

    for (const command of commands) {
      lines.push(getUsage(prefix, command))
    }
  }

  lines.push('')

  console.log(lines.join('\n'))
}
