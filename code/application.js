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
      settings: assign({
        aliases: {}
      }, settings),
      action: action
    }
  }

  run (callback) {
    callback = callback || function () {}

    var context0 = this.context.length > 1 ? this.context[0] : false

    if (context0) {
      let options = last(this.context)
      let abbrevs = abbrev(Object.keys(this.commands))

      try {
        if (!abbrevs[context0]) {
          throw new Error(context0 + ' not found')
        }

        this.context.shift()
        let command = this.commands[abbrevs[context0]]
        let action = command.action
        let params = getParams(action)

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
            let missing = params.slice(this.context.length - 1, -2)

            throw new Error('missing argument' + (missing.length > 1 ? 's' : '') + ' (' + missing.join(', ') + ') for ' + abbrevs[context0])
          } else if (this.context.length > params.length - 1) {
            throw new Error('too many arguments for ' + abbrevs[context0])
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
      } catch (err) {
        output.error(chalk.red(err))

        callback(err)
      }
    }
  }
}
