module.exports = function (argv, opts) {
  argv = argv.slice(0)
  const args = {}

  // add a prop property and camelcase it and make aliases part of opts definitions
  Object.keys(opts).forEach((optKey) => {
    opts[optKey].key = optKey

    let split = optKey.split('-')

    opts[optKey].property = opts[optKey].property || split[0] + split.slice(1).map((part) => part.substr(0, 1).toUpperCase() + part.substr(1)).join('')

    if (opts[optKey].aliases) {
      opts[optKey].aliases.forEach((alias) => {
        opts[alias] = Object.assign({}, opts[optKey], {alias: true})
      })
    }
  })

  // handle arguments after --
  let afterDashDash = []
  let indexOfDashDash = argv.indexOf('--')

  if (indexOfDashDash > -1) {
    afterDashDash = argv.slice(indexOfDashDash + 1)

    argv = argv.slice(0, indexOfDashDash)
  }

  // normalize -abc and -abc=value
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

  let toBeDeleted = []

  // loop through argv
  for (let i = 0; i < argv.length; i++) {
    Object.keys(opts).forEach((optKey) => {
      let search = optKey.length === 1 ? '-' + optKey : '--' + optKey
      let vals = []

      if (argv[i] === search) {
        if (opts[optKey].type !== Boolean) {
          if (argv[i + 1] != null && (!argv[i + 1].startsWith('-') || argv[i + 1].startsWith('---') || argv[i + 1] === '-')) {
            vals.push(argv[i + 1])

            toBeDeleted.push(i + 1)
          }
        } else {
          vals.push(true)
        }

        toBeDeleted.push(i)
      } else if (argv[i].startsWith(search + '=')) {
        if (opts[optKey].type !== Boolean) {
          vals.push(argv[i].substr(argv[i].indexOf('=') + 1))

          toBeDeleted.push(i)
        } else {
          throw new Error((opts[optKey].key.length === 1 ? '-' : '--') + opts[optKey].key + ' is a boolean and does not accept a value')
        }
      }

      if (opts[optKey].type != null) {
        let type = opts[optKey].type

        vals = vals.map((val) => type(val))
      }

      if (vals != null && vals.length) {
        if (opts[optKey].multiple === true) {
          args[opts[optKey].property] = args[opts[optKey].property] != null ? args[opts[optKey].property].concat(vals) : vals
        } else {
          args[opts[optKey].property] = vals.pop()
        }
      }
    })
  }

  Object.keys(opts).filter((optKey) => opts[optKey].alias !== true).forEach((optKey) => {
    if (args[opts[optKey].property] == null && opts[optKey].default != null) {
      args[opts[optKey].property] = opts[optKey].default
    }

    if (args[opts[optKey].property] == null && opts[optKey].required === true) {
      throw new Error((opts[optKey].key.length === 1 ? '-' : '--') + opts[optKey].key + ' is required')
    }
  })

  // delete used argv items
  argv = argv.reduce((argv, arg, i) => {
    if (!toBeDeleted.includes(i)) {
      argv.push(arg)
    }

    return argv
  }, [])

  // throw errors for unknown options
  argv.forEach((arg) => {
    if (arg.startsWith('-') && !arg.startsWith('---')) {
      let key = arg.split('=')[0]

      throw new Error('unknown option ' + key)
    }
  })

  // now handle _
  args._ = argv.concat(afterDashDash).filter((arg) => arg !== '')

  return args
}
