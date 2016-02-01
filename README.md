# sergeant

A CLI solution inspired by [Commander.js](https://github.com/tj/commander.js).

## an example

```javascript
var app = require('sergeant')()
var assert = require('assert')

app.command('command1')
.parameter('title', 'the title')
.option('option1', 'option 1')
.action(function (args) {
  assert.ok(args.get('title'), 'the title is required')

  return Promise.resolve(true)
})

```
