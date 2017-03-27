# sergeant

A CLI solution with simple argument parsing and built in help messages.

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

__{aliases, default, description, multiple, required, type}__

- aliases: Optional. An array of strings, each an alias.
- default: Optional. The default value if none is given.
- description: A short description
- multiple: Optional. A boolean. If true then multiple values are accepted.
- required: Optional. A boolean. If true it is required.
- type: A function like Boolean or Number. The value is passed to it to cast it to that type.
