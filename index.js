'use strict'

const asyncDone = require('async-done')
const chalk = require('chalk')
const unquote = require('unquote')
const repeat = require('repeat-string')
const getParams = require('get-params')
const ap = require('ap')

class App {
  constructor (description, context) {

    this.description = description
    this.context = context || sergeant.parse()

    this.commands = {}
  }

  command (name, description, options, action) {

    this.commands[name] = {
      description: description,
      options: options,
      action: action
    }
  }

  run (callback) {
    var context_first = this.context.length > 1 ? this.context[0] : false
    var options = this.context[this.context.length - 1]
    var command
    var results = []
    var cols = []
    var longest = 0
    var usage
    var params
    var missing
    var action

    callback = callback || function (err, result) {
      if (err) {
        console.error(chalk.red(err))
      } else {
        if (typeof result === 'string') {
          console.log(chalk.green(result))
        }
      }
    }

    try {
      if (context_first) {
        if (!this.commands[context_first]) {
          throw new Error(context_first + ' not found')
        }

        command = this.commands[context_first]

        if (options.help) {
          usage = getParams(command.action).slice(0, -2).map(function (v) { return '<' + v + '>' }).join(' ')

          results.push(chalk.magenta('Usage:') + ' [options] ' + context_first + ' ' + usage)
          results.push(command.description)
          if (Object.keys(command.options).length) {
            results.push(chalk.magenta('Options:'))
          }

          for (let o in command.options) {
            if (o.length > longest) {
              longest = o.length
            }

            cols.push([o, command.options[o]])
          }
        }
      } else if (options.help) {
        if (!command) {
          results.push(this.description)
          if (Object.keys(this.commands).length) {
            results.push(chalk.magenta('Commands:'))
          }

          for (let c in this.commands) {
            usage = '[options] ' + c + ' ' + getParams(this.commands[c].action).map(function (v) { return '<' + v + '>' }).slice(0, -2).join(' ')

            if (usage.length > longest) {
              longest = usage.length
            }

            cols.push([usage, this.commands[c].description])
          }
        }
      } else {
        throw new Error('run with --help to get a list of commands')
      }

      if (options.help) {
        longest += 2

        cols.forEach(function (v) {
          results.push(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
        })

        callback(null, results.join('\n'))
      } else if (command) {
        this.context.shift()
        action = command.action
        params = getParams(action)

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
      }
    } catch (error) {
      callback(error)
    }
  }
}

function sergeant (description, argv) {
  return new App(description, argv)
}

sergeant.parse = function (argv) {
  argv = argv || process.argv.slice(2)

  var context = []
  var options = {}
  let parts

  argv.forEach(function (val, key) {
    if (val.startsWith('--')) {
      val = val.substr(2)

      if (val) {
        parts = val.split('=')

        if (val.startsWith('no-')) {
          if (parts.length === 1) {
            options[parts[0].substr(3)] = false
          } else {
            options[parts[0]] = unquote(parts.slice(1).join('='))
          }
        } else {
          if (parts.length === 1) {
            options[parts[0]] = true
          } else {
            options[parts[0]] = unquote(parts.slice(1).join('='))
          }
        }
      }
    } else {
      context.push(unquote(val))
    }
  })

  context.push(options)

  return context
}

module.exports = sergeant
