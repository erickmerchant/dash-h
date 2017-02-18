'use strict'

const globals = require('./globals')
const console = globals.console
const process = globals.process
const HelpError = require('../help-error')
const list = require('./list')
const chalk = require('chalk')
const AssertionError = require('assert').AssertionError

module.exports = class {
  constructor (args, name) {
    this.args = args

    this.name = name || ''

    this.count = 0

    this.description = ''

    this.optionsParameters = new Map()

    this.option('help', 'display this message')

    this.alias('h', 'help')
  }

  describe (description) {
    this.description = description

    return this
  }

  option (key, description) {
    this.optionsParameters.set(key, {
      key: key,
      aliases: [],
      description: description || ''
    })

    return this
  }

  alias (alias, key) {
    let option = this.optionsParameters.get(key)

    if (option != null) {
      this.optionsParameters.set(alias, {
        key: key,
        alias: true
      })

      option.aliases.push(alias)
    }

    return this
  }

  parameter (key, description) {
    this.optionsParameters.set(this.count, {
      key: key,
      description: description || ''
    })

    this.count += 1

    return this
  }

  action (action) {
    this.callback = (args) => action(args)

    return this
  }

  run (offset = 0) {
    try {
      let args = new Map()
      let result

      this.optionsParameters.forEach((arg, key) => {
        let value = this.args.get(Number.isInteger(key) ? key + offset : key)
        let k = arg.key

        if (value != null) {
          args.set(k, value)
        }
      })

      if (args.get('help')) {
        this.help()

        return Promise.resolve(true)
      }

      result = typeof this.callback === 'function' ? this.callback(args) : true

      if (typeof result === 'object' && result instanceof Promise) {
        return result.catch(this.error)
      }

      return Promise.resolve(result)
    } catch (e) {
      return this.error(e)
    }
  }

  help () {
    let paramCount = 0
    let optCount = 0

    let output = list`
${this.description ? `${chalk.green('Description:')} ${chalk.gray(this.description)}

` : ''}${chalk.green('Usage:') + ' ' + this.name + ' ' + (this.optionsParameters.size ? [...this.optionsParameters]
.filter(([key, arg]) => !arg.alias)
.map(([key, arg]) => {
  if (Number.isInteger(key)) {
    paramCount++

    return '<' + arg.key + '>'
  }

  optCount++

  return '[' + (arg.key.length < 2 ? '-' : '--') + arg.key + ']'
}).join(' ') : '')}${paramCount ? list`

${chalk.green('Parameters:')}

${[...this.optionsParameters].map(([key, arg]) => {
  if (Number.isInteger(key)) {
    return [arg.key, chalk.gray(arg.description)]
  }
})}` : ''}${optCount ? list`

${chalk.green('Options:')}

${[...this.optionsParameters].map(([key, arg]) => {
  if (!arg.alias && !Number.isInteger(key)) {
    return [
      (arg.key.length < 2 ? '-' : '--') + arg.key + arg.aliases.map(function (alias) {
        return ',' + (alias.length < 2 ? '-' : '--') + alias
      }).join(''),
      chalk.gray(arg.description)
    ]
  }
})}` : ''}
`
    console.error(output)
  }

  error (e) {
    process.exitCode = 1

    if (typeof e === 'object' && (e instanceof HelpError || e instanceof AssertionError)) {
      console.error(chalk.red(e.message))

      return Promise.resolve(true)
    }

    return Promise.reject(e)
  }
}
