'use strict'

const asyncDone = require('async-done')
const getParams = require('get-params')
const assign = require('object-assign')
const last = require('lodash.last')
const ap = require('ap')
const chalk = require('chalk')
const abbrev = require('abbrev')
const repeat = require('repeat-string')
const output = require('./output.js')

module.exports = class {

  constructor (settings, context) {
    this.settings = settings

    this.context = context

    this.commands = {}
  }

  command (name, settings, action) {
    if (arguments.length < 3) {
      action = settings
      settings = {}
    }

    this.commands[name] = {
      settings: assign({
        description: '',
        options: {},
        aliases: {}
      }, settings),
      action: action
    }
  }

  run (callback) {
    callback = callback || function () {}

    let context_first = this.context.length > 1 ? this.context[0] : false
    let options = last(this.context)
    let command
    let params
    let missing
    let action
    let abbrevs = abbrev(Object.keys(this.commands))

    try {

      if (context_first && context_first !== 'help') {
        if (!abbrevs[context_first] || !this.commands[abbrevs[context_first]]) {
          throw new Error(context_first + ' not found')
        }

        command = this.commands[abbrevs[context_first]]
      }

      if (options.help || context_first === 'help') {

        this.help(callback, command)
      } else if (command) {

        this.context.shift()
        action = command.action
        params = getParams(action)

        for (let s in command.settings.aliases) {
          if (options[s] === true) {
            delete options[s]

            options = assign(options, command.settings.aliases[s])
          }
        }

        this.context.pop()
        this.context.push(options)

        if (params.length > 1) {
          if (this.context.length < params.length - 1) {
            missing = params.slice(this.context.length - 1, -2)

            throw new Error('missing argument' + (missing.length > 1 ? 's' : '') + ' (' + missing.join(', ') + ') for ' + context_first)
          }

          if (this.context.length > params.length - 1) {
            throw new Error('too many arguments for ' + context_first)
          }

          action = ap(this.context, action)
        }

        asyncDone(action, function (err) {
          if (err) {
            output.error(chalk.red(err))

            callback(err)
          } else {
            callback()
          }
        })
      } else {
        throw new Error('run with --help to get a list of commands')
      }
    } catch (error) {
      output.error(chalk.red(error))

      callback(error)
    }
  }

  help (callback, command) {
    let context_first = this.context.length > 1 ? this.context[0] : false
    let cols = []
    let longest = 0
    let usage

    if (command) {
      usage = getParams(command.action).slice(0, -2).map(function (v) { return '<' + v + '>' }).join(' ')

      output.log(chalk.magenta('Description:') + ' ' + command.settings.description)
      output.log(chalk.magenta('Usage:') + ' [options] ' + context_first + ' ' + usage)
      if (Object.keys(command.settings.options).length) {
        output.log(chalk.magenta('Options:'))
      }

      for (let o in command.settings.options) {
        if (o.length > longest) {
          longest = o.length
        }

        cols.push([o, command.settings.options[o]])
      }

      longest += 2

      cols.forEach(function (v) {
        output.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
      })

      longest = 0
      cols = []

      if (Object.keys(command.settings.aliases).length) {
        output.log(chalk.magenta('Aliases:'))
      }

      for (let o in command.settings.aliases) {
        let alias = []

        if (o.length > longest) {
          longest = o.length
        }

        for (let k in command.settings.aliases[o]) {
          if (command.settings.aliases[o][k] === true) {
            alias.push('--' + k)
          } else {
            alias.push('--' + k + '="' + command.settings.aliases[o][k].replace('"', '\"') + '"')
          }
        }

        cols.push([o, alias.join(' ')])
      }

      longest += 2

      cols.forEach(function (v) {
        output.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
      })
    } else {
      output.log(chalk.magenta('Description:') + ' ' + this.settings.description)
      if (Object.keys(this.commands).length) {
        output.log(chalk.magenta('Commands:'))
      }

      for (let c in this.commands) {
        usage = '[options] ' + c + ' ' + getParams(this.commands[c].action).map(function (v) { return '<' + v + '>' }).slice(0, -2).join(' ')

        if (usage.length > longest) {
          longest = usage.length
        }

        cols.push([usage, this.commands[c].settings.description])
      }

      longest += 2

      cols.forEach(function (v) {
        output.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
      })
    }

    callback()
  }
}
