'use strict'

const Command = require('./command')
const HelpError = require('../help-error')
const log = require('./log')
const chalk = require('chalk')

module.exports = class extends Command {
  constructor (args) {
    super(args)

    this.commands = new Map()

    this.description = ''

    this.command('help')
    .describe('provide help for the application or a command')
    .parameter('command', 'the command you need help with')
    .action((args) => {
      if (args.get('command')) {
        let command = this.commands.get(args.get('command'))

        if (!command) {
          throw new HelpError()
        }

        command.help()
      } else {
        this.help()
      }
    })
  }

  command (name) {
    let command = new Command(this.args, name)

    this.commands.set(name, command)

    return command
  }

  run () {
    let command

    try {
      if (!this.args.has(0) || !this.commands.has(this.args.get(0))) {
        throw new HelpError()
      }

      command = this.commands.get(this.args.get(0))

      return command.run()
    } catch (e) {
      if (typeof e === 'object' && e instanceof HelpError) {
        log.error(chalk.red('run `help` for a list of commands'))
      }

      return Promise.reject(e)
    }
  }

  help () {
    let output = ''

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

        command.optionsParameters.forEach((arg, key) => {
          if (Number.isInteger(key)) {
            output += '<' + arg.key + '> '
          } else {
            output += '[' + (arg.key.length < 2 ? '-' : '--') + arg.key + '] '
          }
        })

        output += '\n'
      })
    }

    log.error(output)
  }
}
