const parse = require('./parse')

console.log(parse(process.argv.slice(2), {
  aaa: {
    type: 'boolean',
    default: false,
    aliases: ['a']
  }
}))
