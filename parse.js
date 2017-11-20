const chalk = require('chalk')
const { console, process } = require('./src/globals')
const { isNumber, addDashes, getDefault } = require('./src/helpers')

module.exports = function (argv, definitions) {
  try {
    definitions = Object.assign({}, definitions)

    argv = argv.slice(0)
    const args = {}

    Object.keys(definitions).forEach((key) => {
      const definition = definitions[key]

      const split = definition.key.split('-')

      definition.property = split[0] + split.slice(1).map((part) => part.substr(0, 1).toUpperCase() + part.substr(1)).join('')

      if (definition.aliases) {
        definition.aliases.forEach((alias) => {
          definitions[alias] = Object.assign({}, definition, {alias: true})
        })
      }
    })

    let afterDashDash = []
    const indexOfDashDash = argv.indexOf('--')

    if (indexOfDashDash > -1) {
      afterDashDash = argv.slice(indexOfDashDash + 1)

      argv = argv.slice(0, indexOfDashDash)
    }

    argv = argv.reduce((argv, arg) => {
      if (arg !== '-' && arg.startsWith('-') && !arg.startsWith('--')) {
        if (arg.indexOf('=') > -1) {
          argv.push('-' + arg.substr(arg.indexOf('=') - 1))

          arg = arg.substring(1, arg.indexOf('=') - 1)
        } else {
          arg = arg.substr(1)
        }

        argv = argv.concat(arg.split('').map((arg) => '-' + arg))
      } else {
        argv.push(arg)
      }

      return argv
    }, [])

    const toBeDeleted = []
    const optionKeys = Object.keys(definitions).filter((key) => isNumber(key) === false)

    for (let i = 0; i < argv.length; i++) {
      optionKeys.forEach((key) => {
        const search = addDashes(key)
        const definition = definitions[key]
        const property = definition.property
        let vals = []

        if (argv[i] === search) {
          if (definition.type !== Boolean) {
            if (argv[i + 1] != null && (!argv[i + 1].startsWith('-') || argv[i + 1].startsWith('---') || argv[i + 1] === '-')) {
              vals.push(argv[i + 1])

              toBeDeleted.push(i + 1)
            }
          } else {
            vals.push(true)
          }

          toBeDeleted.push(i)
        } else if (argv[i].startsWith(search + '=')) {
          if (definition.type !== Boolean) {
            vals.push(argv[i].substr(argv[i].indexOf('=') + 1))

            toBeDeleted.push(i)
          } else {
            throw new Error(addDashes(definition.key) + ' is a boolean and does not accept a value')
          }
        }

        if (vals != null && vals.length) {
          if (definition.type != null) {
            vals = vals.map((val) => definition.type(val))
          }

          if (definition.multiple === true) {
            args[property] = args[property] != null ? args[property].concat(vals) : vals
          } else if (args[property] != null) {
            throw new Error(addDashes(definition.key) + ' does not accept multiple values')
          } else {
            args[property] = vals.pop()
          }
        }
      })
    }

    optionKeys.filter((key) => definitions[key].alias !== true).forEach((key) => {
      const definition = definitions[key]
      const property = definition.property

      if (args[property] == null) {
        if (definition.default != null) {
          args[property] = getDefault(definition)
        }

        if (definition.required === true && args['help'] !== true) {
          throw new Error(addDashes(definition.key) + ' is required')
        }
      }
    })

    argv = argv.reduce((argv, arg, i) => {
      if (!toBeDeleted.includes(i)) {
        argv.push(arg)
      }

      return argv
    }, [])

    argv.forEach((arg) => {
      if (arg.startsWith('-') && !arg.startsWith('---')) {
        throw new Error('unknown option ' + arg.split('=')[0])
      }
    })

    const remainder = argv.concat(afterDashDash).filter((arg) => arg !== '')

    const parameterKeys = Object.keys(definitions).filter((key) => isNumber(key))
    const hasMultiple = parameterKeys.filter((key) => definitions[key].multiple).length > 0

    if (!hasMultiple && remainder.length > parameterKeys.length) {
      throw new Error('too many arguments')
    }

    parameterKeys.forEach((key) => {
      const definition = definitions[key]
      const property = definition.property
      const remainingKeys = parameterKeys.length - 1 - key

      if (!remainder.length) {
        if (definition.default != null) {
          args[property] = getDefault(definition)
        }

        if (definition.required === true && args['help'] !== true) {
          throw new Error(definition.key + ' is required')
        }
      } else if (definition.multiple === true) {
        args[property] = remainder.splice(0, remainder.length - remainingKeys)

        if (definition.type) {
          args[property] = args[property].map((v) => definition.type(v))
        }
      } else if (definition.type) {
        args[property] = definition.type(remainder.shift())
      } else {
        args[property] = remainder.shift()
      }
    })

    return args
  } catch (error) {
    process.exitCode = 1

    console.error(chalk.red(error.message))
  }
}
