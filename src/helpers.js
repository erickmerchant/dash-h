const addDashes = (name) => (name.length === 1 ? '-' : '--') + name

const spaces = (number) => ' '.repeat(number)

const resolveProperty = (options, key) => {
  if (typeof options[key] === 'string' && options[options[key]] != null) {
    return options[key]
  }

  return key
}

module.exports = {addDashes, spaces, resolveProperty}
