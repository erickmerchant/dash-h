'use strict'

module.exports = class {
  constructor () {
    this.count = 0

    this.description = ''

    this.args = new Map()
  }

  describe (description) {
    this.description = description

    return this
  }

  option (key, description, handler) {
    this.args.set(key, {
      key: key,
      description: description || '',
      handler: handler || ((v) => v)
    })

    return this
  }

  parameter (key, description, handler) {
    this.args.set(this.count, {
      key: key,
      description: description || '',
      handler: handler || ((v) => v)
    })

    this.count += 1

    return this
  }

  action (action) {
    this.act = (args) => action(args)

    return this
  }
}
