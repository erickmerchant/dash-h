'use strict'

const asyncDone = require('async-done')
const chalk = require('chalk')
const unquote = require('unquote')
const repeat = require('repeat-string')
const ap = require('ap')

class App {
  constructor (description, context) {

    this.description = description
    this.context = context || sergeant.parse()

    this.commands = {}
  }

  command (usage, description, options, action) {
    const parts = usage.split(' ')
    const name = parts[0]
    const args = parts.slice(1).map(function (v) {
      return v.substr(1, v.length - 2)
    })

    this.commands[name] = {
      usage: usage,
      description: description,
      options: options,
      args: args,
      action: action
    }
  }

  run (callback) {
    callback = callback || function (err, result) {
      if (err) {
        console.error(chalk.red(err))
      } else {
        if (result) {
          console.log(result)
        }
      }
    }
    var command
    var results = []
    var cols = []
    var longest = 0
    var context_first = this.context.length > 1 ? this.context[0] : false
    var options = this.context[this.context.length - 1]

    try {
      if (context_first) {
        if (!this.commands[context_first]) {
          throw new Error(context_first + ' not found')
        }

        command = this.commands[context_first]

        if (options.help) {
          results.push(chalk.magenta('Usage:') + ' [options] ' + command.usage)
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
          results.push(chalk.magenta('Usage:') + ' [options] <command>')
          results.push(this.description)
          if (Object.keys(this.commands).length) {
            results.push(chalk.magenta('Commands:'))
          }

          for (let c in this.commands) {
            c = this.commands[c]

            if (c.usage.length > longest) {
              longest = c.usage.length
            }

            cols.push([c.usage, c.description])
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
        if (this.context.length - 2 !== command.args.length) {
          throw new Error('incorrect usage of ' + context_first)
        }

        this.context.shift()

        asyncDone(ap(this.context, command.action), callback)
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

  argv.forEach(function (val, key) {
    if (val.startsWith('--')) {
      val = val.substr(2)

      if (val) {
        let parts = val.split('=')

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
