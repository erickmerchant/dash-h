'use strict'

const output = require('./output.js')
const asyncDone = require('async-done')
const getParams = require('get-params')
const assign = require('object-assign')
const last = require('lodash.last')
const ap = require('ap')
const chalk = require('chalk')
const abbrev = require('abbrev')

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
      name: name,
      settings: assign({
        aliases: {}
      }, settings),
      action: action
    }
  }

  run (callback) {
    callback = callback || function () {}

    let context0 = this.context.length > 1 ? this.context[0] : false
    let options = last(this.context)
    let abbrevs = abbrev(Object.keys(this.commands))
    let command
    let params
    let missing
    let action
    let err

    if (context0) {
      if (!abbrevs[context0]) {
        err = new Error(context0 + ' not found')

        output.error(chalk.red(err))

        callback(err)
      } else {
        command = this.commands[abbrevs[context0]]

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

            err = new Error('missing argument' + (missing.length > 1 ? 's' : '') + ' (' + missing.join(', ') + ') for ' + command.name)

            output.error(chalk.red(err))

            callback(err)
          } else if (this.context.length > params.length - 1) {
            err = new Error('too many arguments for ' + command.name)

            output.error(chalk.red(err))

            callback(err)
          }

          action = ap(this.context, action)
        }

        if (!err) {
          asyncDone(action, function (err) {
            if (err) {
              output.error(chalk.red(err))

              callback(err)
            } else {
              callback()
            }
          })
        }
      }
    } else {
      callback()
    }
  }
}
