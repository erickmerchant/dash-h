module.exports = function (argv, definitions) {
  definitions = Object.assign({}, definitions)

  argv = argv.slice(0)
  const args = {}

  Object.keys(definitions).forEach((key) => {
    const definition = definitions[key]

    if (definition.key == null) {
      definition.key = key
    }

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
  const optionKeys = Object.keys(definitions).filter((key) => Number.isInteger(Number(key)) === false)

  for (let i = 0; i < argv.length; i++) {
    optionKeys.forEach((key) => {
      const search = key.length === 1 ? '-' + key : '--' + key
      const definition = definitions[key]
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
          throw new Error((definition.key.length === 1 ? '-' : '--') + definition.key + ' is a boolean and does not accept a value')
        }
      }

      if (vals != null && vals.length) {
        if (definition.type != null) {
          vals = vals.map((val) => definition.type(val))
        }

        if (definition.multiple === true) {
          args[definition.property] = args[definition.property] != null ? args[definition.property].concat(vals) : vals
        } else {
          args[definition.property] = vals.pop()
        }
      }
    })
  }

  optionKeys.filter((key) => definitions[key].alias !== true).forEach((key) => {
    const definition = definitions[key]

    if (args[definition.property] == null) {
      if (definition.default != null) {
        args[definition.property] = definition.default
      }

      if (definition.required === true && args['help'] !== true) {
        throw new Error((definition.key.length === 1 ? '-' : '--') + definitions[key].key + ' is required')
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

  const parameterKeys = Object.keys(definitions).filter((key) => Number.isInteger(Number(key)))

  if (remainder.length > parameterKeys.length) {
    throw new Error('too many arguments')
  }

  parameterKeys.forEach((key) => {
    const definition = definitions[key]

    if (remainder[key] == null) {
      if (definition.default != null) {
        args[definition.property] = definition.default
      }

      if (definition.required === true && args['help'] !== true) {
        throw new Error(definition.key + ' is required')
      }
    } else if (definition.type) {
      args[definition.property] = definition.type(remainder[key])
    } else {
      args[definition.property] = remainder[key]
    }
  })

  return args
}
