# sergeant

A CLI solution with simple argument parsing and built in help messages.

## Example

``` javascript
const command = require('sergeant')
const assert = require('assert')

command('hello', function ({option, parameter, command}) {
  parameter('name', {
    description: 'the name',
    required: true
  })

  option('loud', {
    description: 'say it loud',
    aliases: ['l']
  })

  command('world', function ({option}) {
    option('loud', {
      description: 'say it loud',,
      aliases: ['l']
    })

    return function (args) {
      say('world', args.loud)
    }
  })

  return function (args) {
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

## API Reference

### command

__command(name, description, define)__

- name: A string. The name of your command
- description: A string. A short description. Optional
- [define](#define): A function to define your command

### define

__define({[option, parameter, command})__

- [option](#option)
- [parameter](#parameter)
- [command](#command)

It should return a function to call when the command is run. See [action](#action)

### option

__option(key, definition)__

- key: The name of the option
- [definition](#definition): An object that defines your option

### parameter

__parameter(key, definition)__

- key: The name of the parameter
- [definition](#definition): An object that defines your parameter

### action

__action(args)__

It's passed args which are all the options and parameters when run.

### definition

__{aliases, description, multiple, required, type}__

- aliases: Optional. An array of strings, each an alias.
- description: A short description
- multiple: Optional. A boolean. If true then multiple values are accepted.
- required: Optional. A boolean. If true it is required.
- type: A function that should return the default if no value is given.
