const kleur = require('kleur')
const { console, process } = require('./src/globals')
const { addDashes, camelCaseFromDash } = require('./src/helpers')

module.exports = (argv, { options, parameters }) => {
  try {
    argv = argv.slice(0)
    const args = {}

    options = options.reduce((options, definition) => {
      definition = { ...definition, property: camelCaseFromDash(definition.key) }

      options.push(definition)

      if (definition.alias) {
        options.push({ ...definition, key: definition.alias, alias: true })
      }

      return options
    }, [])

    parameters = parameters.reduce((parameters, definition) => {
      definition = { ...definition, property: camelCaseFromDash(definition.key) }

      parameters.push(definition)

      return parameters
    }, [])

    let afterDashDash = []
    const indexOfDashDash = argv.indexOf('--')

    if (indexOfDashDash > -1) {
      afterDashDash = argv.slice(indexOfDashDash + 1)

      argv = argv.slice(0, indexOfDashDash)
    }

    argv = argv.reduce((argv, arg) => {
      if (arg !== '-' && arg.startsWith('-') && !arg.startsWith('--')) {
        if (arg.indexOf('=') > -1) {
          argv.push(`-${ arg.substr(arg.indexOf('=') - 1) }`)

          arg = arg.substring(1, arg.indexOf('=') - 1)
        } else {
          arg = arg.substr(1)
        }

        argv = argv.concat(arg.split('').map((arg) => `-${ arg }`))
      } else {
        argv.push(arg)
      }

      return argv
    }, [])

    const toBeDeleted = []

    for (let i = 0; i < argv.length; i++) {
      for (const definition of options) {
        const search = addDashes(definition.key)
        const property = definition.property
        const vals = []
        const isSearch = argv[i] === search
        const isSearchWithValue = argv[i].startsWith(`${ search }=`)
        const nextIsValid = argv[i + 1] != null && (!argv[i + 1].startsWith('-') || argv[i + 1].startsWith('---') || argv[i + 1] === '-')
        const isBoolean = definition.type == null

        if (isSearch && isBoolean) {
          vals.push(true)

          toBeDeleted.push(i)
        } else if (isSearch && nextIsValid && !isBoolean) {
          vals.push(argv[i + 1])

          toBeDeleted.push(i + 1)

          toBeDeleted.push(i)
        } else if (isSearchWithValue && !isBoolean) {
          vals.push(argv[i].substr(argv[i].indexOf('=') + 1))

          toBeDeleted.push(i)
        } else if (isSearch && !isBoolean) {
          throw new Error(`${ addDashes(definition.key) } is not a boolean and requires a value`)
        } else if (isSearchWithValue && isBoolean) {
          throw new Error(`${ addDashes(definition.key) } is a boolean and does not accept a value`)
        }

        if (vals != null && vals.length) {
          if (definition.multiple === true) {
            args[property] = args[property] != null ? args[property].concat(vals) : vals
          } else if (args[property] != null) {
            throw new Error(`${ addDashes(definition.key) } does not accept multiple values`)
          } else {
            args[property] = vals.pop()
          }
        }
      }
    }

    for (const definition of options.filter((option) => options.alias !== true)) {
      const property = definition.property

      if (args[property] == null) {
        if (definition.type != null) {
          const _default = definition.type()

          if (_default != null) {
            args[property] = _default
          } else if (definition.required === true && args.help !== true) {
            throw new Error(`${ addDashes(definition.key) } is required`)
          }
        } else if (definition.required !== true) {
          args[property] = false
        } else if (definition.required === true && args.help !== true) {
          throw new Error(`${ addDashes(definition.key) } is required`)
        }
      } else if (definition.type != null) {
        args[property] = definition.type(args[property])
      }
    }

    argv = argv.reduce((argv, arg, i) => {
      if (!toBeDeleted.includes(i)) {
        argv.push(arg)
      }

      return argv
    }, [])

    for (const arg of argv) {
      if (arg.startsWith('-') && !arg.startsWith('---')) {
        throw new Error(`unknown option ${ arg.split('=')[0] }`)
      }
    }

    const remainder = argv.concat(afterDashDash).filter((arg) => arg !== '')

    const hasMultiple = parameters.filter((definition) => definition.multiple).length > 0

    if (!hasMultiple && remainder.length > parameters.length) {
      throw new Error('too many arguments')
    }

    let remainingKeys = parameters.length

    for (const definition of parameters) {
      const property = definition.property
      remainingKeys -= 1

      if (!remainder.length) {
        if (definition.type != null) {
          const _default = definition.type()

          if (_default != null) {
            args[property] = _default
          } else if (definition.required === true && args.help !== true) {
            throw new Error(`${ definition.key } is required`)
          }
        } else if (definition.required === true && args.help !== true) {
          throw new Error(`${ definition.key } is required`)
        }
      } else if (definition.multiple === true) {
        args[property] = remainder.splice(0, remainder.length - remainingKeys)

        if (definition.type != null) {
          args[property] = definition.type(args[property])
        }
      } else if (definition.type != null) {
        args[property] = definition.type(remainder.shift())
      } else {
        args[property] = remainder.shift()
      }
    }

    return args
  } catch (error) {
    process.exitCode = 1

    console.error(kleur.red(error.message))
  }
}
