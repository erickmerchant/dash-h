# sergeant

A CLI solution inspired by [Commander.js](https://github.com/tj/commander.js).

## an example

```javascript
var app = require('sergeant')()

app.command('command1')
  .parameter('title', function (val) {
    // validate parameters and options by throwing exceptions
    assert.ok(typeof val === 'string')

    return val + '...' // transform them
  })
  .option('option1', function (val) {
    // validate options and options by throwing exceptions
    assert.ok(typeof val === 'string')

    return val + '...' // transform them
  })
  .action(function (args) {

    return Promise.resolve(true)
  })

```
