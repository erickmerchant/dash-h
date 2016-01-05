'use strict'

const HelpError = require('./help-error')
const Application = require('./application')
const log = require('./log')
const chalk = require('chalk')

module.exports = class extends Application {
  constructor (args) {
    super(args)

    this.command('help')
    .describe('provide help for the application or a command')
    .parameter('command', 'the command you need help with', (command) => {
      if (command) {
        if (!this.commands.has(command)) {
          throw new HelpError(command + ' not found')
        }

        return command
      }
    })
    .action((args) => {
      var output = ''

      if (args.get('command')) {
        let command = this.commands.get(args.get('command'))
        let paramLongest = 0
        let optLongest = 0
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

              paramLongest = length > paramLongest ? length : paramLongest
            } else {
              output += ' [--' + arg.key + ']'

              length += 2

              optCount++
              optLongest = length > optLongest ? length : optLongest
            }
          })

          output += '\n'

          if (paramCount) {
            output += '\n'
            output += chalk.green('Parameters:')
            output += '\n'

            command.args.forEach((arg, key) => {
              if (Number.isInteger(key)) {
                output += '  ' + ' '.repeat(paramLongest - arg.key.length) + chalk.bold.gray(arg.key) + '  ' + arg.description + '\n'
              }
            })
          }

          if (optCount) {
            output += '\n'
            output += chalk.green('Options:')
            output += '\n'

            command.args.forEach((arg, key) => {
              if (!Number.isInteger(key)) {
                output += '  ' + ' '.repeat(optLongest - arg.key.length - 2) + chalk.bold.gray('--' + arg.key) + '  ' + arg.description + '\n'
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
}
