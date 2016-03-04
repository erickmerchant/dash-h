'use strict'

const HelpError = require('./help-error')
const log = require('./log')
const chalk = require('chalk')

module.exports = class {
  constructor (args) {
    this.args = args

    this.count = 0

    this.description = ''

    this._args = new Map()
  }

  describe (description) {
    this.description = description

    return this
  }

  option (key, description) {
    this._args.set(key, {
      key: key,
      description: description || ''
    })

    return this
  }

  parameter (key, description) {
    this._args.set(this.count, {
      key: key,
      description: description || ''
    })

    this.count += 1

    return this
  }

  action (action) {
    this._action = (args) => action(args)

    return this
  }

  run () {
    try {
      var args = new Map()
      var result

      this._args.forEach((arg, key) => {
        var value = this.args.get(Number.isInteger(key) ? key + 1 : key) || null
        var k = arg.key

        args.set(k, value)
      })

      result = typeof this._action === 'function' ? this._action(args) : true

      if (typeof result === 'object' && result instanceof Promise) {
        return result
      }

      return Promise.resolve(result)
    } catch (e) {
      if (typeof e === 'object' && e instanceof HelpError) {
        log.error(chalk.red('run `help` for a list of commands'))
      }

      return Promise.reject(e)
    }
  }

  help (name) {
    name = name || ''

    var output = ''
    let argLongest = 0
    let paramCount = 0
    let optCount = 0

    if (this.description) {
      output += chalk.green('Description:') + ' ' + this.description + '\n\n'
    }

    output += chalk.green('Usage:') + ' ' + name

    if (this._args.size) {
      this._args.forEach((arg, key) => {
        let length = arg.key.length

        if (Number.isInteger(key)) {
          output += ' <' + arg.key + '>'

          paramCount++
        } else {
          output += ' [--' + arg.key + ']'

          length += 2

          optCount++
        }

        argLongest = length > argLongest ? length : argLongest
      })

      output += '\n'

      if (paramCount) {
        output += '\n'
        output += chalk.green('Parameters:')
        output += '\n'

        this._args.forEach((arg, key) => {
          if (Number.isInteger(key)) {
            output += '  ' + ' '.repeat(argLongest - arg.key.length) + chalk.bold.gray(arg.key) + '  ' + arg.description + '\n'
          }
        })
      }

      if (optCount) {
        output += '\n'
        output += chalk.green('Options:')
        output += '\n'

        this._args.forEach((arg, key) => {
          if (!Number.isInteger(key)) {
            output += '  ' + ' '.repeat(argLongest - arg.key.length - 2) + chalk.bold.gray('--' + arg.key) + '  ' + arg.description + '\n'
          }
        })
      }
    }

    log.error(output)
  }
}
