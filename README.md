# sergeant

A CLI solution inspired by [Commander.js](https://github.com/tj/commander.js).

## an example (multiple commands)

```javascript
var app = require('sergeant')()
var assert = require('assert')

app.command('command1')
.parameter('param1', 'param1')
.option('option1', 'option1')
.action(function (args) {
  assert.ok(args.get('param1'), 'param1 is required')

  return Promise.resolve(true)
})

app.command('command2')
.parameter('param2', 'param2')
.option('option2', 'option2')
.action(function (args) {
  assert.ok(args.get('param2'), 'param2 is required')

  return Promise.resolve(true)
})

app.run()

```

## an example (single command)

```javascript
var command = require('sergeant').command()
var assert = require('assert')

command
.parameter('param1', 'param1')
.option('option1', 'option1')
.action(function (args) {
  assert.ok(args.get('param1'), 'param1 is required')

  return Promise.resolve(true)
})

command.run()

```
