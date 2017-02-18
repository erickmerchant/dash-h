'use strict'

const globals = require('./globals')
const console = globals.console
const Command = require('./command')
const HelpError = require('../help-error')
const format = require('./format-output')
const chalk = require('chalk')

module.exports = class extends Command {
  constructor (args) {
    super(args)

    this.commands = new Map()

    this.description = ''

    this.command('help')
    .describe('Provide help for the application or a command.')
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

    this.callback = () => {
      throw new HelpError('Command not found. Run `help` for a list of commands.')
    }
  }

  command (name) {
    let command = new Command(this.args, name)

    this.commands.set(name, command)

    return command
  }

  run () {
    if (!this.args.has(0) || !this.commands.has(this.args.get(0))) {
      return super.run(1)
    }

    let command = this.commands.get(this.args.get(0))

    return command.run(1)
  }

  help () {
    if (this.commands.has(this.args.get('help'))) {
      let command = this.commands.get(this.args.get('help'))

      return command.help()
    }

    let output = []

    if (this.description) {
      output.push(format`${chalk.green('Description:')} ${chalk.gray(this.description)}`)
    }

    if (this.commands.size) {
      output.push(format`${chalk.green('Commands:')}

${[...this.commands].map(([key, command]) => {
  return [
    key,
    chalk.gray(command.description || '')
  ]
})}`)
    }

    console.error('\n' + output.join('\n\n') + '\n')
  }
}
