'use strict'

const Command = require('./command.js')
const defaults = require('./defaults.js')
const assign = require('lodash.assign')
const repeat = require('lodash.repeat')
const dezalgo = require('dezalgo')
const once = require('once')
const ap = require('ap')

module.exports = class {
  constructor (settings) {
    this.settings = assign(defaults, settings)

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

    var arg0 = this.settings.context.args.length ? this.settings.context.args[0] : false
    var command = false
    var args, action, result, done, aliases

    if (arg0 && this.commands[arg0]) {
      command = this.commands[arg0]
    }

    if (command && this.settings.context.options.help) {
      this.settings.context.args.unshift('')

      command = this.help
    }

    if (command) {
      args = {}
      aliases = command.get('aliases')

      Object.keys(aliases).forEach(function (s) {
        var alias = aliases[s]

        if (this.settings.context.options[s] === true) {
          delete this.settings.context.options[s]

          this.settings.context.options = assign(this.settings.context.options, alias)
        }
      }, this)

      try {
        this.settings.context.args.shift()

        if (this.settings.context.args.length < Object.keys(command.get('parameters')).length) {
          let missing = Object.keys(command.get('parameters')).slice(this.settings.context.args.length)

          throw new Error('missing argument' + (missing.length > 1 ? 's' : '') + ' (' + missing.join(', ') + ') for ' + arg0)
        }

        if (this.settings.context.args.length > Object.keys(command.get('parameters')).length) {
          throw new Error('too many arguments for ' + arg0)
        }

        done = once(dezalgo(function (err) {
          if (err) {
            this.settings.error(err)

            callback(err)
          } else {
            callback()
          }
        }.bind(this)))

        Object.keys(command.get('parameters')).forEach(function (param) {
          args[param] = this.settings.context.args.shift()
        }, this)

        action = ap([args, this.settings.context.options, done].slice(0 - command.get('action').length), command.get('action'))

        result = action()

        if (result && typeof result.then === 'function') {
          result.then(function () {
            callback()
          }).catch(done)
        }
      } catch (err) {
        this.settings.error(err)

        callback(err)
      }
    } else {
      let err = new Error('run help to get a list of commands')

      this.settings.error(err)

      callback(err)
    }
  }

  appHelp (options, done) {
    var cols = []
    var longest = 0
    var usage

    if (this.description) {
      this.settings.log(this.settings.primary('Description:') + ' ' + this.description)
    }

    this.settings.log(this.settings.primary('Commands:'))

    for (let c in this.commands) {
      usage = '[options] ' + c + ' ' + Object.keys(this.commands[c].get('parameters')).map(function (v) { return '<' + v + '>' }).join(' ')

      if (usage.length > longest) {
        longest = usage.length
      }

      cols.push([usage, this.commands[c].get('description')])
    }

    longest += 2

    cols.forEach(function (v) {
      this.settings.log(' ' + this.settings.secondary(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    }.bind(this))

    done()
  }

  commandHelp (args, options, done) {
    var command = this.commands[args.command]
    var cols = []
    var longest = 0
    var usage = Object.keys(command.get('parameters')).map(function (v) { return '<' + v + '>' }).join(' ').trim()

    this.settings.log(this.settings.primary('Description:') + ' ' + command.get('description'))
    this.settings.log(this.settings.primary('Usage:') + ' [options] ' + args.command + (usage ? ' ' + usage : ''))

    if (Object.keys(command.get('parameters')).length) {
      this.settings.log(this.settings.primary('Parameters:'))
    }

    Object.keys(command.get('parameters')).forEach(function (p) {
      if (p.length > longest) {
        longest = p.length
      }

      cols.push([p, command.get('parameters')[p].description || ''])
    })

    longest += 2

    cols.forEach(function (v) {
      this.settings.log(' ' + this.settings.secondary(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    }.bind(this))

    longest = 0
    cols = []

    this.settings.log(this.settings.primary('Options:'))

    for (let o in command.get('options')) {
      let oDashed = (o.length === 1 ? '-' : '--') + o

      if (oDashed.length > longest) {
        longest = oDashed.length
      }

      cols.push([oDashed, command.get('options')[o].description])
    }

    longest += 2

    cols.forEach(function (v) {
      this.settings.log(' ' + this.settings.secondary(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    }.bind(this))

    longest = 0
    cols = []

    if (Object.keys(command.get('aliases')).length) {
      this.settings.log(this.settings.primary('Aliases:'))
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
      this.settings.log(' ' + this.settings.secondary(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    }.bind(this))

    done()
  }
}
