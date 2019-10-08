const {red} = require('kleur')
const {console, process} = require('./src/globals.js')
const {addDashes, resolveProperty} = require('./src/helpers.js')

module.exports = (argv, {signature, options}) => {
  try {
    argv = argv.slice(0)
    const args = {}

    let afterDashDash = []
    const indexOfDashDash = argv.indexOf('--')

    if (indexOfDashDash > -1) {
      afterDashDash = argv.slice(indexOfDashDash + 1)

      argv = argv.slice(0, indexOfDashDash)
    }

    argv = argv.reduce((argv, arg) => {
      if (arg !== '-' && arg.startsWith('-') && !arg.startsWith('--')) {
        if (arg.indexOf('=') > -1) {
          argv.push(`-${arg.substring(arg.indexOf('=') - 1)}`)

          arg = arg.substring(1, arg.indexOf('=') - 1)
        } else {
          arg = arg.substring(1)
        }

        argv.push(...arg.split('').map((arg) => `-${arg}`))
      } else {
        argv.push(arg)
      }

      return argv
    }, [])

    const toBeDeleted = []

    let i = -1

    const resolvedSignature = signature.map((key) => resolveProperty(options, key))

    while (++i < argv.length) {
      for (const key of Object.keys(options)) {
        const property = resolveProperty(options, key)
        const definition = options[property]
        const search = addDashes(key)
        const vals = []
        const isSearch = argv[i] === search
        const isSearchWithValue = argv[i].startsWith(`${search}=`)
        const nextIsValid = argv[i + 1] != null && (!argv[i + 1].startsWith('-') || argv[i + 1].startsWith('---') || argv[i + 1] === '-')
        const isBoolean = !definition.parameter

        if (isSearch && isBoolean) {
          vals.push(true)

          toBeDeleted.push(i)
        } else if (isSearch && nextIsValid && !isBoolean) {
          vals.push(argv[i + 1])

          toBeDeleted.push(i + 1)

          toBeDeleted.push(i)
        } else if (isSearchWithValue && !isBoolean) {
          vals.push(argv[i].substring(argv[i].indexOf('=') + 1))

          toBeDeleted.push(i)
        } else if (isSearch && !isBoolean) {
          throw Error(`${addDashes(property)} is not a boolean and requires a value`)
        } else if (isSearchWithValue && isBoolean) {
          throw Error(`${addDashes(property)} is a boolean and does not accept a value`)
        }

        if (vals != null && vals.length) {
          if (definition.multiple) {
            args[property] = args[property] != null ? [...args[property], ...vals] : vals
          } else if (args[property] != null) {
            throw Error(`${addDashes(property)} does not accept multiple values`)
          } else {
            args[property] = vals.pop()
          }
        }
      }
    }

    for (const key of Object.keys(options)) {
      const property = resolveProperty(options, key)

      if (key !== property) continue

      const definition = options[property]

      if (args.help !== true) {
        if (args[property] == null) {
          if (definition.parameter) {
            if (definition.default != null) {
              args[property] = definition.default
            } else if (definition.required && !resolvedSignature.includes(property)) {
              throw Error(`${addDashes(property)} is required`)
            }
          } else if (definition.required !== true) {
            args[property] = false
          } else if (definition.required) {
            throw Error(`${addDashes(property)} is required`)
          }
        }
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
        throw Error(`unknown option ${arg.split('=')[0]}`)
      }
    }

    const remainder = [...argv, ...afterDashDash].filter((arg) => arg !== '')

    let remainingNames = signature.length

    for (const key of signature) {
      const property = resolveProperty(options, key)
      const definition = options[property]

      remainingNames--

      if (!remainder.length) {
        if (definition.parameter) {
          if (definition.default != null) {
            args[property] = definition.default
          } else if (definition.required && args.help !== true) {
            throw Error(`${addDashes(property)} is required`)
          }
        } else if (definition.required && args.help !== true) {
          throw Error(`${addDashes(property)} is required`)
        }
      } else if (definition.multiple) {
        args[property] = remainder.splice(0, remainder.length - remainingNames)
      } else if (definition.parameter) {
        args[property] = remainder.shift()
      } else {
        args[property] = remainder.shift()
      }
    }

    const hasMultiple = signature.filter((key) => {
      const definition = options[resolveProperty(options, key)]

      return definition != null && definition.multiple
    }).length > 0

    if (!hasMultiple && remainder.length > signature.length) {
      throw Error('too many arguments')
    }

    return args
  } catch (error) {
    process.exitCode = 1

    console.error(red(error.message))
  }
}
