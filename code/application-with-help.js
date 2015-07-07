'use strict'

const output = require('./output.js')
const getParams = require('get-params')
const assign = require('object-assign')
const last = require('lodash.last')
const chalk = require('chalk')
const abbrev = require('abbrev')
const repeat = require('lodash.repeat')
const options = { '--help': 'provide help for this command' }
const Application = require('./application.js')

module.exports = class extends Application {

  constructor (settings, context) {
    super(settings, context)

    const self = this

    this.command('help', { description: 'provides help for the application' }, function (options, done) {
      var cols = []
      var longest = 0
      var usage

      if (self.settings.description) {
        output.log(chalk.magenta('Description:') + ' ' + self.settings.description)
      }

      if (Object.keys(self.commands).length) {
        output.log(chalk.magenta('Commands:'))
      }

      for (let c in self.commands) {
        usage = '[options] ' + c + ' ' + getParams(self.commands[c].action).map(function (v) { return '<' + v + '>' }).slice(0, -2).join(' ')

        if (usage.length > longest) {
          longest = usage.length
        }

        cols.push([usage, self.commands[c].settings.description])
      }

      longest += 2

      cols.forEach(function (v) {
        output.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
      })

      done()
    })
  }

  command (name) {
    super.command.apply(this, [].slice.call(arguments))

    var settings = this.commands[name].settings

    settings.parameters = settings.parameters || {}

    settings.options = assign({}, options, settings.options || {})
  }

  run (callback) {
    callback = callback || function () {}

    var context0 = this.context.length > 1 ? this.context[0] : false
    var options = last(this.context)
    var abbrevs = abbrev(Object.keys(this.commands))

    if (context0 && abbrevs[context0] && options.help) {
      let command = this.commands[abbrevs[context0]]
      let cols = []
      let longest = 0
      let params = getParams(command.action).slice(0, -2)
      let usage = params.map(function (v) { return '<' + v + '>' }).join(' ')

      output.log(chalk.magenta('Description:') + ' ' + command.settings.description)
      output.log(chalk.magenta('Usage:') + ' [options] ' + abbrevs[context0] + ' ' + usage)

      if (Object.keys(command.settings.parameters).length) {
        output.log(chalk.magenta('Parameters:'))
      }

      params.forEach(function (p) {

        if (command.settings.parameters[p]) {
          if (p.length > longest) {
            longest = p.length
          }

          cols.push([p, command.settings.parameters[p]])
        }
      })

      longest += 2

      cols.forEach(function (v) {
        output.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
      })

      longest = 0
      cols = []

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
          } else if (typeof command.settings.aliases[o][k] === 'string') {
            alias.push('--' + k + '="' + command.settings.aliases[o][k] + '"')
          } else {
            alias.push('--' + k + '=' + command.settings.aliases[o][k])
          }
        }

        cols.push([o, alias.join(' ')])
      }

      longest += 2

      cols.forEach(function (v) {
        output.log(' ' + chalk.cyan(v[0]) + repeat(' ', longest - v[0].length) + v[1])
      })

      callback()
    } else if (context0) {
      super.run(callback)
    } else {
      let err = new Error('run help to get a list of commands')

      output.error(chalk.red(err))

      callback(err)
    }
  }
}
