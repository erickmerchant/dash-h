'use strict'

const HelpError = require('../help-error')
const log = require('./log')
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

  run (offset) {
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
    let output = ''
    let paramCount = 0
    let optCount = 0

    if (this.description) {
      output += chalk.green('Description:') + ' ' + this.description + '\n\n'
    }

    output += chalk.green('Usage:') + ' ' + this.name

    if (this.optionsParameters.size) {
      this.optionsParameters.forEach((arg, key) => {
        if (!arg.alias) {
          if (Number.isInteger(key)) {
            output += ' <' + arg.key + '>'

            paramCount++
          } else {
            output += ' [' + (arg.key.length < 2 ? '-' : '--') + arg.key + ']'

            optCount++
          }
        }
      })

      output += '\n'

      if (paramCount) {
        output += '\n'
        output += chalk.green('Parameters:')
        output += '\n'

        this.optionsParameters.forEach((arg, key) => {
          if (Number.isInteger(key)) {
            output += ' ' + chalk.bold.gray(arg.key) + ' ' + arg.description + '\n'
          }
        })
      }

      if (optCount) {
        output += '\n'
        output += chalk.green('Options:')
        output += '\n'

        this.optionsParameters.forEach((arg, key) => {
          if (!arg.alias) {
            if (!Number.isInteger(key)) {
              output += ' ' + chalk.bold.gray((arg.key.length < 2 ? '-' : '--') + arg.key)

              if (arg.aliases.length) {
                arg.aliases.forEach(function (alias) {
                  output += ',' + chalk.bold.gray((alias.length < 2 ? '-' : '--') + alias)
                })
              }

              output += ' ' + arg.description + '\n'
            }
          }
        })
      }
    }

    log.error(output)
  }

  error (e) {
    if (typeof e === 'object' && (e instanceof HelpError || e instanceof AssertionError)) {
      log.error(chalk.red(e.message))

      return Promise.resolve(true)
    }

    return Promise.reject(e)
  }
}
