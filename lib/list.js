module.exports = function (list) {
  list = list.filter((a) => a != null)

  let longest = list.reduce((a, b) => a > b[0].length ? a : b[0].length, 0)

  return list.map((item) => {
    return '  ' + ' '.repeat(longest - item[0].length) + item[0] + '  ' + item[1]
  }).join('\n')
}
