# sergeant

A CLI solution inspired by [Commander.js](https://github.com/tj/commander.js).

## an example

```javascript
var sergeant = require('sergeant')
var app = sergeant()

app.describe('an example application')

app.command('command1')
  .describe('an example command')
  .parameter('parameter1', 'an example parameter', function (val) {
    // validate parameters and options by throwing exceptions
    assert.ok(typeof parameter1 === 'string')

    return val + '...' // transform them
  })
  .option('option1', 'an example option')
  .option('option2', 'another example option')
  .alias('o', { option1: true, option2: false })
  .alias('not-o', { option1: false, option2: true })
  .action(function (args, options, done) {

    // actions can have any number of parameters
    // they can use the done callback, or a promise

    done()
  })

```
