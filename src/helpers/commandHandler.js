const { lookUpHistory } = require('src/commands/history/index.js')
const { lookUpWhosell } = require('src/commands/whosell/index.js')
const { loadToml } = require('src/helpers/tomlLoader.js')

const CONFIG = loadToml('config/config.toml')

const handleCommand = (msg, client) => {
  const command = msg.content.split(CONFIG.command_prefix)[1].split(' ')[0]
  if (command === 'h') return lookUpHistory(msg, client)
  if (command === 'ws') return lookUpWhosell(msg, client)
  // return msg.reply(`Wrong command`)
}

module.exports = { handleCommand }