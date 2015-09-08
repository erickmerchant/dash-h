'use strict'

module.exports = class {
  constructor () {
    this.settings = {
      description: '',
      options: {
        'help': {
          description: 'provide help for this command'
        }
      },
      parameters: {},
      aliases: {}
    }
  }

  alias (alias, options) {
    this.settings.aliases[alias] = options

    return this
  }

  describe (description) {
    this.settings.description = description

    return this
  }

  parameter (parameter, description, handler) {
    this.settings.parameters[parameter] = {
      description: description,
      handler: handler
    }

    return this
  }

  option (option, description, handler) {
    this.settings.options[option] = {
      description: description,
      handler: handler
    }

    return this
  }

  action (action) {
    this.settings.action = action

    return this
  }

  get (key) {
    return this.settings[key]
  }
}
