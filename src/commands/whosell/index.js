const logger = require('logger')
const { queryById } = require('src/commands/whosell/queryById.js')
const { queryByName } = require('src/commands/whosell/queryByName.js')
const { isNumber } = require('src/helpers/argumentHandler.js')
const { loadToml } = require('src/helpers/tomlLoader.js')

const CONFIG = loadToml('config/config.toml')

const errMsg = `
\`\`\`
Usage: ${CONFIG.prefix}ws <id|name>

Example:

${CONFIG.command_prefix}ws 4001
${CONFIG.command_prefix}ws Poring Card
\`\`\`
`

const lookUpWhosell = (msg, client) => {
  try {
    logger.debug(`${msg.author.tag}: ${msg.content}`)
    if (msg.content.trim().split(' ').length < 2) return msg.reply(errMsg)

    const arg = msg.content.trim().split(' ').slice(1).join(' ')

    if (isNumber(arg)) return queryById(arg, msg);
    return queryByName(arg, msg, client);
  }
  catch (e) {
    logger.error(e)
  }
}

module.exports = { lookUpWhosell }