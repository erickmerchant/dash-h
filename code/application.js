'use strict'

const Command = require('./command')
const HelpError = require('./help-error')
const log = require('./log')
const chalk = require('chalk')

module.exports = class {
  constructor (args) {
    this.args = args
    this.commands = new Map()

    this.description = ''
  }

  describe (description) {
    this.description = description

    return this
  }

  command (name) {
    var command = new Command()

    this.commands.set(name, command)

    return command
  }

  run () {
    var command
    var args = new Map()
    var result = new Promise((resolve, reject) => {
      var result

      if (!this.args.has(0)) {
        throw new HelpError('run `help` for a list of commands')
      }

      if (!this.commands.has(this.args.get(0))) {
        throw new HelpError(this.args.get(0) + ' not found')
      }

      command = this.commands.get(this.args.get(0))

      command.args.forEach((arg, key) => {
        try {
          var value = arg.handler(this.args.get(Number.isInteger(key) ? key + 1 : key), args)

          if (value !== undefined && arg.key) {
            args.set(arg.key, value)
          }
        } catch (e) {
          if (arg.key && typeof e === 'object' && e instanceof HelpError) {
            e.message = 'problem with ' + (Number.isInteger(key) ? '<' + arg.key + '>' : '--' + key) + ': ' + e.message
          }

          throw e
        }
      })

      result = typeof command.act === 'function' ? command.act(args) : true

      if (typeof result === 'object' && result instanceof Promise) {
        result.then(resolve).catch(reject)
      } else {
        resolve(result)
      }
    })

    return result.catch(function (e) {
      if (typeof e === 'object' && e instanceof HelpError) {
        log.error(chalk.red(e.message))
      }

      throw e
    })
  }
}
