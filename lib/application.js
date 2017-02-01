'use strict'

const Command = require('./command')
const HelpError = require('../help-error')
const log = require('./log')
const list = require('./list')
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
          throw new HelpError('Command not found. Run `help` for a list of commands.')
        }

        command.help()
      } else {
        this.help()
      }
    })
  }

  command (name) {
    let command = new Command(this.args, name, false)

    this.commands.set(name, command)

    return command
  }

  run () {
    let command

    try {
      if (!this.args.has(0) || !this.commands.has(this.args.get(0))) {
        throw new HelpError('Command not found. Run `help` for a list of commands.')
      }

      command = this.commands.get(this.args.get(0))

      return command.run(1).catch(this.error)
    } catch (e) {
      return this.error(e)
    }
  }

  help () {
    let output = ''

    if (this.description) {
      output += '\n' + chalk.green('Description:') + ' ' + this.description + '\n'
    }

    if (this.commands.size) {
      output += '\n' + chalk.green('Commands:') + '\n'

      output += '\n' + list([...this.commands].map(([key, command]) => {
        return [
          chalk.bold.gray(key),
          [...command.optionsParameters].map(([key, arg]) => {
            if (!arg.alias) {
              if (Number.isInteger(key)) {
                return '<' + arg.key + '>'
              }

              return '[' + (arg.key.length < 2 ? '-' : '--') + arg.key + ']'
            }
          }).join(' ')
        ]
      })) + '\n'
    }

    log.error(output)
  }
}
