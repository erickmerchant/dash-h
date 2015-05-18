'use strict'

const asyncDone = require('async-done')
const chalk = require('chalk')
const unquote = require('unquote')
const repeat = require('repeat-string')

class App {
  constructor (description, argv) {
    this.description = description
    this.argv = argv
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

    callback = callback || function () {}

    let context = { options: {} }
    let command

    try {
      this.argv.forEach(function (val, key) {
        if (!command && !val.startsWith('-')) {
          if (val in this.commands) {
            command = this.commands[val]
          } else {
            throw new Error(val + ' not found')
          }
        } else {
          if (command && !val.startsWith('-')) {
            for (let i = 0; i < command.args.length; i++) {
              if (typeof context[command.args[i]] === 'undefined') {
                context[command.args[i]] = unquote(val)

                break
              }
            }
          } else {
            if (val.startsWith('--')) {
              val = val.substr(2)

              if (val) {
                let parts = val.split('=')

                if (val.startsWith('no-')) {
                  if (parts.length === 1) {
                    context.options[parts[0].substr(3)] = false
                  } else {
                    throw new Error('negated options don\'t take values')
                  }
                } else {
                  if (parts.length === 1) {
                    context.options[parts[0]] = true
                  } else {
                    context.options[parts[0]] = unquote(parts.slice(1).join('='))
                  }
                }
              }
            }
          }
        }
      }.bind(this))

      if (context.options.help) {
        let cols = []
        let longest = 0
        if (!command) {
          console.log(chalk.magenta('Usage:') + ' [options] <command>')
          console.log(this.description)
          console.log(chalk.magenta('Commands:'))

          for (let c in this.commands) {
            c = this.commands[c]

            if (c.usage.length > longest) {
              longest = c.usage.length
            }

            cols.push([c.usage, c.description])
          }
        } else {
          console.log(chalk.magenta('Usage:') + ' [options] ' + command.usage)
          console.log(command.description)
          console.log(chalk.magenta('Options:'))

          for (let o in command.options) {
            if (o.length > longest) {
              longest = o.length
            }

            cols.push([o, command.options[o]])
          }
        }

        longest += 2

        cols.forEach(function (v) {
          console.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
        })

        callback()
      } else {
        if (command) {
          asyncDone(command.action.bind(context), function (err, res) {
            if (err) {
              console.error(chalk.red(err))
            }

            callback(err, res)
          })
        } else {
          throw new Error('run with --help to get a list of commands')
        }
      }
    } catch(err) {
      console.error(chalk.red(err))

      callback(err)
    }
  }
}

module.exports = function (description, argv) {
  return new App(description, argv)
}
