const HelpError = require('./help-error')

module.exports = {
  multiple: function (v, args) {
    if (!Array.isArray(v)) {
      v = [v]
    }

    return v
  },
  single: function (v, args) {
    if (Array.isArray(v)) {
      throw new HelpError('only one value accepted')
    }

    return v
  }
}
