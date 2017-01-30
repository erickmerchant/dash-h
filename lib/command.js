'use strict'

const HelpError = require('../help-error')
const log = require('./log')
const chalk = require('chalk')

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

  alias (key, alias) {
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
    this.callAction = (args) => action(args)

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

      if (args.get('help') || args.get('h')) {
        this.help()

        return Promise.resolve(true)
      }

      result = typeof this.callAction === 'function' ? this.callAction(args) : true

      if (typeof result === 'object' && result instanceof Promise) {
        return result
      }

      return Promise.resolve(result)
    } catch (e) {
      if (typeof e === 'object' && e instanceof HelpError) {
        log.error(chalk.red(e.message))
      }

      return Promise.reject(e)
    }
  }

  help () {
    let output = ''
    let argLongest = 0
    let paramCount = 0
    let optCount = 0

    if (this.description) {
      output += chalk.green('Description:') + ' ' + this.description + '\n\n'
    }

    output += chalk.green('Usage:') + ' ' + this.name

    if (this.optionsParameters.size) {
      this.optionsParameters.forEach((arg, key) => {
        if (!arg.alias) {
          let length = arg.key.length

          if (Number.isInteger(key)) {
            output += ' <' + arg.key + '>'

            paramCount++
          } else {
            output += ' [' + (arg.key.length < 2 ? '-' : '--') + arg.key + ']'

            length += (arg.key.length < 2 ? 1 : 2)

            optCount++
          }

          argLongest = length > argLongest ? length : argLongest
        }
      })

      output += '\n'

      if (paramCount) {
        output += '\n'
        output += chalk.green('Parameters:')
        output += '\n'

        this.optionsParameters.forEach((arg, key) => {
          if (Number.isInteger(key)) {
            output += '  ' + ' '.repeat(argLongest - arg.key.length) + chalk.bold.gray(arg.key) + '  ' + arg.description + '\n'
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
              output += '  ' + ' '.repeat(argLongest - arg.key.length - (arg.key.length < 2 ? 1 : 2)) + chalk.bold.gray((arg.key.length < 2 ? '-' : '--') + arg.key) + '  ' + arg.description + '\n'
            }
          }
        })
      }
    }

    log.error(output)
  }
}
