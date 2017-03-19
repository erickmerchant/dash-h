module.exports = function (argv, opts) {
  argv = argv.slice(0)
  const args = {}

  // add a name prop and camelcase it and make aliases part of opts definitions
  Object.keys(opts).forEach((opt) => {
    opt[opt].id = opt

    let split = opt.split('-')

    opt[opt].name = split[0] + split.slice(1).map((part) => part.substr(0, 1).toUppercase() + part.substr(1)).join('')

    if (opts.type === 'boolean' && opts.default == null) {
      opts.default = false
    }

    if (opts.aliases) {
      opts.aliases.forEach((alias) => {
        opts[alias] = opts[opt]
      })
    }
  })

  // handle arguments after --
  let afterDashDash = []
  let indexOfDashDash = argv.indexOf('--')

  if (indexOfDashDash > -1) {
    argv = argv.slice(0, indexOfDashDash)

    afterDashDash = argv.slice(indexOfDashDash)
  }

  // normalize -abc and -abc=value
  argv = argv.reduce((argv, arg) => {
    if (arg.startsWith('-') && !arg.startsWith('--')) {
      if (arg.indexOf('=') > -1) {
        argv.push('-' + arg.substr(0, arg.indexOf('=') - 1))

        arg = arg.substr(1, arg.indexOf('=') - 1)
      } else {
        arg = arg.substr(1)
      }

      argv = argv.concat(arg.split('').map((arg) => '-' + arg + '='))
    } else {
      argv.push(arg)
    }

    return argv
  }, [])

  let toBeDeleted = []
  // loop through opts
  Object.keys(opts).forEach((optKey) => {
    let search = optKey.length === 1 ? '-' + optKey : '--' + optKey
    let vals = []

    for (let i = 0; i < argv.length; i++) {
      if (argv[i] === search) {
        if (opts[optKey].type !== 'boolean') {
          if (argv[i + 1] != null && (!argv[i + 1].startsWith('-') || argv[i + 1].startsWith('---') || argv[i + 1] === '-')) {
            vals.push(argv[i + 1])

            toBeDeleted.push(i + 1)
          }
        } else {
          vals.push(true)
        }

        toBeDeleted.push(i)
      } else if (argv[i].startsWith(search + '=')) {
        vals.push(argv[i].substr())

        toBeDeleted.push(i)
      }
    }

    if (vals == null && opts[optKey].default != null) {
      vals = opts[optKey].default
    }

    if (vals == null && opts[optKey].required === true) {
      throw new Error(opts[optKey].id + ' is required')
    }

    if (opts[optKey].type != null) {
      switch (opts[optKey].type) {
        case 'number':
          vals = vals.map((val) => Number(val))
          break

        case 'boolean':
          vals = vals.map((val) => Boolean(val))
          break
      }
    }

    if (vals != null) {
      if (opts[optKey].multiple === true) {
        args[opts[optKey].name] = vals
      } else {
        args[opts[optKey].name] = vals.pop()
      }
    }
  })

  // delete used argv items
  toBeDeleted.forEach((i) => {
    argv.splice(i, 1)
  })

  // now handle _
  args._ = argv.concat(afterDashDash)

  return args
}
