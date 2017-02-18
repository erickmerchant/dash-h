module.exports = function (strings, ...values) {
  return strings.map(function (v, k) {
    let value = ''

    if (values[k]) {
      value = values[k]

      if (Array.isArray(values[k])) {
        value = list(value)
      }
    }

    return v + value
  })
  .join('')
}

function list (items) {
  items = items.filter((a) => a != null)

  let longest = items.reduce((a, b) => a > b[0].length ? a : b[0].length, 0)

  return items.map((item) => {
    return '  ' + ' '.repeat(longest - item[0].length) + item[0] + '  ' + item[1]
  }).join('\n')
}
