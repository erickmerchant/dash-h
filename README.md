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

const loud = {
  name: 'loud',
  description: 'say it loud',
  alias: 'l'
}

command(['hello'], 'say hello', ({parameter, option}) => {
  parameter({
    name: 'name',
    description: 'the name',
    required: true
  })

  option(loud)

  return (args) => {
    assert.notEqual(args.name, 'world', 'use hello world')

    say(args.name, args.loud)
  }
})

command(['hello', '--world'], 'say hello world', ({option}) => {
  option(loud)

  return (args) => {
    say('world', args.loud)
  }
})

start(process.argv.slice(2))
```

## Options and Parameters

These are the possible properties of options and parameters.

- name: The name
- description: A short description
- alias: Optional. A short alias for the option. (options only)
- multiple: Optional. A boolean. If true then multiple values are accepted.
- required: Optional. A boolean. If true it is required.
- type: A function that should return the default if no value is given. Can be used to cast the value (always a string) to the type required by your program.
