'use strict'

const asyncDone = require('async-done')
const chalk = require('chalk')
const repeat = require('repeat-string')
const getParams = require('get-params')
const assign = require('object-assign')
const last = require('lodash.last')
const ap = require('ap')

class CommandLineApplication {

  constructor (description, context) {
    this.context = context

    this.description = description

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
    let context_first = this.context.length > 1 ? this.context[0] : false
    let options = last(this.context)
    let command
    let params
    let missing
    let action

    callback = callback || function (err, result) {
      if (err) {
        console.error(chalk.red(err))
      } else {
        if (typeof result === 'string') {
          console.log(result)
        }
      }
    }

    try {

      if (context_first) {
        if (!this.commands[context_first]) {
          throw new Error(context_first + ' not found')
        }

        command = this.commands[context_first]
      }

      if (options.help) {
        let results = []
        let cols = []
        let alias = []
        let longest = 0
        let usage

        if (command) {
          usage = getParams(command.action).slice(0, -2).map(function (v) { return '<' + v + '>' }).join(' ')

          results.push(chalk.magenta('Description:') + ' ' + command.settings.description)
          results.push(chalk.magenta('Usage:') + ' [options] ' + context_first + ' ' + usage)
          if (Object.keys(command.settings.options).length) {
            results.push(chalk.magenta('Options:'))
          }

          for (let o in command.settings.options) {
            if (o.length > longest) {
              longest = o.length
            }

            cols.push([o, command.settings.options[o]])
          }

          longest += 2

          cols.forEach(function (v) {
            results.push(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
          })

          longest = 0
          cols = []

          if (Object.keys(command.settings.aliases).length) {
            results.push(chalk.magenta('Aliases:'))
          }

          for (let o in command.settings.aliases) {
            if (o.length > longest) {
              longest = o.length
            }

            for (let k in command.settings.aliases[o]) {
              if (command.settings.aliases[o][k] === true) {
                alias.push('--' + k)
              } else {
                alias.push('--' + k + '=' + command.settings.aliases[o][k])
              }
            }

            cols.push([o, alias.join(' ')])
          }

          longest += 2

          cols.forEach(function (v) {
            results.push(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
          })
        } else {
          results.push(chalk.magenta('Description:') + ' ' + this.description)
          if (Object.keys(this.commands).length) {
            results.push(chalk.magenta('Commands:'))
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
            results.push(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
          })
        }

        callback(null, results.join('\n'))
      } else if (command) {

        this.context.shift()
        action = command.action
        params = getParams(action)

        for (let s in command.settings.aliases) {
          if (options[s]) {
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

        asyncDone(action, callback)
      } else {
        throw new Error('run with --help to get a list of commands')
      }
    } catch (error) {
      callback(error)
    }
  }
}

function sergeant (description, context) {
  return new CommandLineApplication(description, context || sergeant.parse())
}

sergeant.parse = function (argv) {
  argv = argv || process.argv.slice(2)

  let context = []
  let options = {}

  argv.forEach(function (arg) {
    let parts

    if (arg.startsWith('--')) {
      arg = arg.substr(2)

      if (arg) {
        parts = arg.split('=')

        if (parts.length === 1) {
          options[parts[0]] = true
        } else {
          options[parts[0]] = unquote(parts.slice(1).join('='))
        }
      }
    } else if (arg.startsWith('-')) {
      arg.substr(1).split('').forEach(function (v) {
        options[v] = true
      })
    } else {
      context.push(unquote(arg))
    }
  })

  context.push(options)

  return context
}

module.exports = sergeant
