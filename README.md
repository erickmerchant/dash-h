# sergeant

A CLI solution with simple argument parsing and built in help messages.

## Example

``` javascript
const command = require('sergeant')
const assert = require('assert')

command('hello', ({option, parameter, command}) => {
  parameter('name', {
    description: 'the name',
    required: true
  })

  option('loud', {
    description: 'say it loud',
    alias: 'l'
  })

  command('world', ({option}) => {
    option('loud', {
      description: 'say it loud',,
      alias: 'l'
    })

    return (args) => {
      say('world', args.loud)
    }
  })

  return (args) => {
    assert.notEqual(args.name, 'world', 'use hello world')

    say(args.name, args.loud)
  }
})(process.argv.slice(2))

function say (name, loud = false) {
  let message = `hello ${name}!`

  if (loud) {
    message = message.toUpperCase() + '!'
  }

  console.log(message)
}

```

## Options and Parameters

These are the possible properties of options and parameters.

- alias: Optional. A short alias for the option. (options only)
- description: A short description
- multiple: Optional. A boolean. If true then multiple values are accepted.
- required: Optional. A boolean. If true it is required.
- type: A function that should return the default if no value is given.
