var mockery = require('mockery')
var logs = []
var errors = []
var output = {
  log: function (str) {
    logs.push(str)
  },
  error: function (str) {
    errors.push(str)
  }
}

mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
})

mockery.registerMock('./output.js', output)

module.exports = function () {
  logs = []
  errors = []

  return {
    logs: function () {
      return logs
    },
    errors: function () {
      return errors
    }
  }
}
