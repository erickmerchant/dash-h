module.exports = { addDashes, quoteString, longest, spaces, getProperty }

function addDashes (key) {
  return (key.length === 1 ? '-' : '--') + key
}

function quoteString (value) {
  if (Array.isArray(value)) {
    return value.map(quoteString).join(', ')
  }

  const quote = (typeof value === 'string' ? '"' : '')

  return quote + value + quote
}

function longest (arr) {
  return arr.reduce((longest, item) => {
    return item.length > longest ? item.length : longest
  }, 0)
}

function spaces (number) {
  return ' '.repeat(number)
}

function getProperty (definition) {
  const split = definition.key.split('-')
  const property = split[0] + split.slice(1).map((part) => part.substr(0, 1).toUpperCase() + part.substr(1)).join('')

  return property
}
