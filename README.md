# sergeant

A CLI solution with simple argument parsing, sub-commands, and built in help messages.

## Example

``` javascript
// example.js

const {command, start} = require('sergeant')('example.js')
const assert = require('assert')

const say = (name, loud = false) => {
  let message = `hello ${name}.`

  if (loud) {
    message = `${message.toUpperCase()}!`
  }

  console.log(message)
}

const load = {
  loud: {
    description: 'say it loud',
  },
  l: 'loud'
}

command({
  name: 'hello',
  description: 'say hello',
  options: {
    ...loud,
    name: {
      description: 'the name',
      required: true
    },
  },
  action(args) {
    assert.notEqual(args.name, 'world', 'use hello world')

    say(args.name, args.loud)
  }
})

command({
  name: 'hello:world',
  description: 'say hello world',
  options: {
    ...loud
  },
  action(args) {
    say('world', args.loud)
  }
})

start(process.argv.slice(2))
```
