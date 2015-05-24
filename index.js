'use strict'

const asyncDone = require('async-done')
const chalk = require('chalk')
const unquote = require('unquote')
const repeat = require('repeat-string')
const zipObject = require('lodash.zipobject')

class App {
  constructor (description, argv, callback) {
    argv = argv || sergeant.parse(process.argv.slice(2))

    this.description = description
    this.callback = callback || function (err, result) {
      if (err) {
        console.error(chalk.red(err))
      } else {
        console.log(result)
      }
    }
    this.commands = {}
    this.argv = {}

    this.argv.args = argv.args || []
    this.argv.options = argv.options || {}
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

    if (!this.argv.options.help && this.argv.args.length && this.argv.args[0] === name) {
      this.argv.args.unshift()

      let context = zipObject(args, this.argv.args.slice(1))

      context.options = this.argv.options

      asyncDone(action.bind(context), this.callback)
    }
  }

  end () {
    var error
    var command
    var results = []
    var cols = []
    var longest = 0

    if (this.argv.args.length) {
      if (this.commands[this.argv.args[0]]) {
        command = this.commands[this.argv.args[0]]

        if (this.argv.options.help) {
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
      } else {
        error = new Error(this.argv.args[0] + ' not found')
      }
    } else if (this.argv.options.help) {
      if (!command && !error) {
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
    }

    longest += 2

    cols.forEach(function (v) {
      results.push(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
    })

    if (!this.argv.args.length && !this.argv.options.help && !error) {
      error = new Error('run with --help to get a list of commands')
    }

    this.callback(error, results.join('\n'))
  }
}

function sergeant (description, argv, callback) {
  return new App(description, argv, callback)
}

sergeant.parse = function (argv) {
  var args = []
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
      args.push(unquote(val))
    }
  })

  return { args: args, options: options }
}

module.exports = sergeant
