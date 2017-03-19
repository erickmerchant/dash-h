const assert = require('assert')
const chalk = require('chalk')

module.exports = function (name, definition) {
  const options = {}
  const parameters = {}
  const action = definition({parameter, option})

  return function (argv) {
    try {
      argv = argv.slice(0)

    } catch (e) {

    }
  }

  function parameter (name, settings) {
    parameters[name] = settings
  }

  function option (name, settings) {
    options[name] = settings
  }
}

// command('my-command', function ({parameter, option}) {
//   option('test', {
//     description: 'a description'
//   })
//
//   option('path', {
//     type: 'string',
//     description: 'path to something'
//   })
//
//   return function (args) {
//
//   }
// })
