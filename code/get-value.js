const map = new Map([['true', true], ['false', false], ['null', null]])

module.exports = function (val) {

  if (map.has(val)) {
    return map.get(val)
  }

  if (val !== '' && +val === +val) {
    return +val
  }

  return val.replace(/^'(.*)'|"(.*)"$/, '$1$2')
}
