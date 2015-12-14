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
    var action, result, done

    if (arg0 && this.commands[arg0]) {
      command = this.commands[arg0]
    }

    if (command && this.settings.context.options.help) {
      this.settings.context.args.unshift('')

      command = this.help
    }

    if (command) {
      let args = {}
      let options = {}
      let commandAliases = command.get('aliases')
      let commandOptions = command.get('options')
      let commandParameters = command.get('parameters')
      let commandAction = command.get('action')

      Object.keys(commandAliases).forEach(function (s) {
        var alias = commandAliases[s]

        if (this.settings.context.options[s] === true) {
          delete this.settings.context.options[s]

          this.settings.context.options = assign(this.settings.context.options, alias)
        }
      }, this)

      try {
        this.settings.context.args.shift()

        if (this.settings.context.args.length < commandParameters.length) {
          let missing = commandParameters.slice(this.settings.context.args.length)

          throw new Error('missing argument' + (missing.length > 1 ? 's' : '') + ' (' + missing.map(function (m) { return m.name }).join(', ') + ') for ' + arg0)
        }

        if (this.settings.context.args.length > commandParameters.length) {
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

        commandParameters.forEach(function (param) {
          if (this.settings.context.args.length) {
            args[param.name] = param.handler(this.settings.context.args.shift())
          }
        }, this)

        Object.keys(this.settings.context.options).forEach(function (option) {
          options[option] = commandOptions[option] ? commandOptions[option].handler(this.settings.context.options[option]) : this.settings.context.options[option]
        }, this)

        action = ap([args, options, done].slice(0 - commandAction.length), commandAction)

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
      usage = '[options] ' + c + ' ' + this.commands[c].get('parameters').map(function (v) { return '<' + v.name + '>' }).join(' ')

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
    var commandAliases = command.get('aliases')
    var commandOptions = command.get('options')
    var commandParameters = command.get('parameters')
    var commandDescription = command.get('description')
    var cols = []
    var longest = 0
    var usage = commandParameters.map(function (v) { return '<' + v.name + '>' }).join(' ').trim()

    this.settings.log(this.settings.primary('Description:') + ' ' + commandDescription)
    this.settings.log(this.settings.primary('Usage:') + ' [options] ' + args.command + (usage ? ' ' + usage : ''))

    if (commandParameters.length) {
      this.settings.log(this.settings.primary('Parameters:'))
    }

    commandParameters.forEach(function (p) {
      if (p.name.length > longest) {
        longest = p.name.length
      }

      cols.push([p.name, p.description || ''])
    })

    longest += 2

    cols.forEach(function (v) {
      this.settings.log(' ' + this.settings.secondary(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    }.bind(this))

    longest = 0
    cols = []

    this.settings.log(this.settings.primary('Options:'))

    for (let o in commandOptions) {
      let oDashed = (o.length === 1 ? '-' : '--') + o

      if (oDashed.length > longest) {
        longest = oDashed.length
      }

      cols.push([oDashed, commandOptions[o].description])
    }

    longest += 2

    cols.forEach(function (v) {
      this.settings.log(' ' + this.settings.secondary(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    }.bind(this))

    longest = 0
    cols = []

    if (Object.keys(commandAliases).length) {
      this.settings.log(this.settings.primary('Aliases:'))
    }

    for (let o in commandAliases) {
      let alias = []

      if (o.length > longest) {
        longest = o.length
      }

      for (let k in commandAliases[o]) {
        if (commandAliases[o][k] === true) {
          alias.push('--' + k)
        } else if (typeof commandAliases[o][k] === 'string') {
          alias.push('--' + k + '="' + commandAliases[o][k] + '"')
        } else {
          alias.push('--' + k + '=' + commandAliases[o][k])
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
