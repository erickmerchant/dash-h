const addDashes = (name) => (name.length === 1 ? '-' : '--') + name

const longest = (arr) => arr.reduce((longest, item) => (item.length > longest ? item.length : longest), 0)

const spaces = (number) => ' '.repeat(number)

const camelCaseFromDash = (name) => {
  const split = name.split('-').filter((part) => part !== '')
  const property = split[0] + split.slice(1).map((part) => part.substring(0, 1).toUpperCase() + part.substring(1)).join('')

  return property
}

module.exports = {addDashes, longest, spaces, camelCaseFromDash}
