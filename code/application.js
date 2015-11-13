'use strict'

const output = require('./output.js')
const Command = require('./command.js')
const assign = require('lodash.assign')
const repeat = require('lodash.repeat')
const dezalgo = require('dezalgo')
const once = require('once')
const ap = require('ap')
const chalk = require('chalk')

module.exports = class {
  constructor (context) {
    this.context = context
    this.commands = {}
    this.description = ''

    this.command('help').describe('provides help for the application').action(this.appHelp.bind(this))

    this.help = new Command()
    this.help.parameter('command').action(this.commandHelp.bind(this))
  }

  describe (description) {
    this.description = description

    return this
  }

  command (name) {
    var command = new Command()

    this.commands[name] = command

    return command
  }

  run (callback) {
    callback = callback || function () {}

    var arg0 = this.context.args.length ? this.context.args[0] : false
    var command = false
    var args, action, result, done, aliases

    if (arg0 && this.commands[arg0]) {
      command = this.commands[arg0]
    }

    if (command && this.context.options.help) {
      this.context.args.unshift('')

      command = this.help
    }

    if (command) {
      args = {}
      aliases = command.get('aliases')

      Object.keys(aliases).forEach(function (s) {
        var alias = aliases[s]

        if (this.context.options[s] === true) {
          delete this.context.options[s]

          this.context.options = assign(this.context.options, alias)
        }
      }, this)

      try {
        this.context.args.shift()

        if (this.context.args.length < Object.keys(command.get('parameters')).length) {
          let missing = Object.keys(command.get('parameters')).slice(this.context.args.length)

          throw new Error('missing argument' + (missing.length > 1 ? 's' : '') + ' (' + missing.join(', ') + ') for ' + arg0)
        }

        if (this.context.args.length > Object.keys(command.get('parameters')).length) {
          throw new Error('too many arguments for ' + arg0)
        }

        done = once(dezalgo(function (err) {
          if (err) {
            output.error(chalk.red(err))

            callback(err)
          } else {
            callback()
          }
        }))

        Object.keys(command.get('parameters')).forEach(function (param) {
          args[param] = this.context.args.shift()
        }, this)

        action = ap([args, this.context.options, done].slice(0 - command.get('action').length), command.get('action'))

        result = action()

        if (result && typeof result.then === 'function') {
          result.then(function () {
            callback()
          }).catch(done)
        }
      } catch (err) {
        output.error(chalk.red(err))

        callback(err)
      }
    } else {
      let err = new Error('run help to get a list of commands')

      output.error(chalk.red(err))

      callback(err)
    }
  }

  appHelp (options, done) {
    var cols = []
    var longest = 0
    var usage

    if (this.description) {
      output.log(chalk.magenta('Description:') + ' ' + this.description)
    }

    output.log(chalk.magenta('Commands:'))

    for (let c in this.commands) {
      usage = '[options] ' + c + ' ' + Object.keys(this.commands[c].get('parameters')).map(function (v) { return '<' + v + '>' }).join(' ')

      if (usage.length > longest) {
        longest = usage.length
      }

      cols.push([usage, this.commands[c].get('description')])
    }

    longest += 2

    cols.forEach(function (v) {
      output.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    })

    done()
  }

  commandHelp (args, options, done) {
    var command = this.commands[args.command]
    var cols = []
    var longest = 0
    var usage = Object.keys(command.get('parameters')).map(function (v) { return '<' + v + '>' }).join(' ').trim()

    output.log(chalk.magenta('Description:') + ' ' + command.get('description'))
    output.log(chalk.magenta('Usage:') + ' [options] ' + args.command + (usage ? ' ' + usage : ''))

    if (Object.keys(command.get('parameters')).length) {
      output.log(chalk.magenta('Parameters:'))
    }

    Object.keys(command.get('parameters')).forEach(function (p) {
      if (p.length > longest) {
        longest = p.length
      }

      cols.push([p, command.get('parameters')[p].description || ''])
    })

    longest += 2

    cols.forEach(function (v) {
      output.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    })

    longest = 0
    cols = []

    output.log(chalk.magenta('Options:'))

    for (let o in command.get('options')) {
      let oDashed = (o.length === 1 ? '-' : '--') + o

      if (oDashed.length > longest) {
        longest = oDashed.length
      }

      cols.push([oDashed, command.get('options')[o].description])
    }

    longest += 2

    cols.forEach(function (v) {
      output.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    })

    longest = 0
    cols = []

    if (Object.keys(command.get('aliases')).length) {
      output.log(chalk.magenta('Aliases:'))
    }

    for (let o in command.get('aliases')) {
      let alias = []

      if (o.length > longest) {
        longest = o.length
      }

      for (let k in command.get('aliases')[o]) {
        if (command.get('aliases')[o][k] === true) {
          alias.push('--' + k)
        } else if (typeof command.get('aliases')[o][k] === 'string') {
          alias.push('--' + k + '="' + command.get('aliases')[o][k] + '"')
        } else {
          alias.push('--' + k + '=' + command.get('aliases')[o][k])
        }
      }

      cols.push([o, alias.join(' ')])
    }

    longest += 2

    cols.forEach(function (v) {
      output.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    })

    done()
  }
}
