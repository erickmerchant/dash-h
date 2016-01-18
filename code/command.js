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

  option (key, description) {
    this.args.set(key, {
      key: key,
      description: description || ''
    })

    return this
  }

  parameter (key, description) {
    this.args.set(this.count, {
      key: key,
      description: description || ''
    })

    this.count += 1

    return this
  }

  action (action) {
    this.act = (args) => action(args)

    return this
  }
}
