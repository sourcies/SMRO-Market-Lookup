const { readFileSync } = require('fs')
const toml = require('toml')

const loadToml = (filename) => {
  const data = readFileSync(filename, { encoding: 'utf8' })
  return toml.parse(data)
}

module.exports = { loadToml }