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

    this.command('help')
    .describe('provide help for the application or a command')
    .parameter('command', 'the command you need help with', (command) => {
      if (command) {
        if (!this.commands.has(command)) {
          throw new HelpError()
        }

        return command
      }
    })
    .action((args) => {
      var output = ''

      if (args.get('command')) {
        let command = this.commands.get(args.get('command'))
        let argLongest = 0
        let paramCount = 0
        let optCount = 0

        if (command.description) {
          output += chalk.green('Description:') + ' ' + command.description + '\n\n'
        }

        output += chalk.green('Usage:') + ' ' + args.get('command')

        if (command.args.size) {
          command.args.forEach((arg, key) => {
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

            command.args.forEach((arg, key) => {
              if (Number.isInteger(key)) {
                output += '  ' + ' '.repeat(argLongest - arg.key.length) + chalk.bold.gray(arg.key) + '  ' + arg.description + '\n'
              }
            })
          }

          if (optCount) {
            output += '\n'
            output += chalk.green('Options:')
            output += '\n'

            command.args.forEach((arg, key) => {
              if (!Number.isInteger(key)) {
                output += '  ' + ' '.repeat(argLongest - arg.key.length - 2) + chalk.bold.gray('--' + arg.key) + '  ' + arg.description + '\n'
              }
            })
          }
        }
      } else {
        if (this.description) {
          output += chalk.green('Description:') + ' ' + this.description + '\n\n'
        }

        if (this.commands.size) {
          output += chalk.green('Commands:') + '\n'

          let commandLongest = 0

          this.commands.forEach((command, key) => {
            commandLongest = key.length > commandLongest ? key.length : commandLongest
          })

          this.commands.forEach((command, key) => {
            output += '  ' + ' '.repeat(commandLongest - key.length) + chalk.bold.gray(key) + '  '

            if (command.args.size) {
              command.args.forEach((arg, key) => {
                if (Number.isInteger(key)) {
                  output += '<' + arg.key + '> '
                } else {
                  output += '[--' + arg.key + '] '
                }
              })
            }

            output += '\n'
          })
        }
      }

      log.error(output)
    })
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

      if (!this.args.has(0) || !this.commands.has(this.args.get(0))) {
        throw new HelpError()
      }

      command = this.commands.get(this.args.get(0))

      command.args.forEach((arg, key) => {
        var value = arg.handler(this.args.get(Number.isInteger(key) ? key + 1 : key))
        var k = arg.key

        args.set(k, value)
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
        log.error(chalk.red('run `help` for a list of commands'))
      }

      throw e
    })
  }
}
