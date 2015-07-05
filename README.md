# sergeant

A CLI solution inspired by [Commander.js](https://github.com/tj/commander.js) and [gulp](https://github.com/gulpjs/gulp).

Essentially I was using gulp for all sorts of things, and got sick of having to either separate anything that had parameters out of the gulpfile, or just convert those parameters into options. Also I was not happy with any of the existing option parsers. And I wanted built in help with colors.

## an example

```javascript
var sergeant = require('sergeant')
var app = sergeant({
  description: 'an example application'
})

app.command('command1', {
  // the settings object is optional
  // description, parameters, and options are used for --help
  description: 'an example command',
  parameters: {
    parameter1: 'an example parameter'
  },
  options: {
    '--option1': 'an example option'
  },
  // aliases are converted to options
  aliases: {
    o: { option1: true }
    'not-option1': { option1: false }
  }
}, function (parameter1, options, done) {

  // validate parameters and options by throwing exceptions
  assert.ok(typeof parameter1 === 'string')

  // actions can have any number of parameters
  // they can use the done callback, or use any of the other strategies of completion supported by async-done

  done()
})

app.command('command2',
  // parallel and series return a function that takes options and done. Options are passed along to all nested functions when run. Every function may use the done callback or anything supported by async-done
  sergeant.parallel(
  function (options, done) {

  },
  sergeant.series(
    function (options) {

    },
    function (options) {

    }
  )
))
```
