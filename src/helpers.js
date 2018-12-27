const addDashes = (key) => (key.length === 1 ? '-' : '--') + key

const longest = (arr) => arr.reduce((longest, item) => (item.length > longest ? item.length : longest), 0)

const spaces = (number) => ' '.repeat(number)

const camelCaseFromDash = (key) => {
  const split = key.split('-').filter((part) => part !== '')
  const property = split[0] + split.slice(1).map((part) => part.substr(0, 1).toUpperCase() + part.substr(1)).join('')

  return property
}

module.exports = { addDashes, longest, spaces, camelCaseFromDash }
