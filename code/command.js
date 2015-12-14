'use strict'

module.exports = class {
  constructor () {
    this.settings = {
      description: '',
      options: {},
      parameters: [],
      aliases: {}
    }

    this.option('help', 'provide help for this command')
  }

  alias (alias, options) {
    this.settings.aliases[alias] = options

    return this
  }

  describe (description) {
    this.settings.description = description

    return this
  }

  parameter (name, description, handler) {
    this.settings.parameters.push({
      name: name,
      description: description,
      handler: handler || function (param) { return param }
    })

    return this
  }

  option (option, description, handler) {
    this.settings.options[option] = {
      description: description,
      handler: handler || function (opt) { return opt }
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
