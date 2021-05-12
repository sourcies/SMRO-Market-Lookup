const logger = require('logger')
const { queryById } = require('src/commands/history/queryById.js')
const { queryByName } = require('src/commands/history/queryByName.js')
const { isNumber } = require('src/helpers/argumentHandler.js')
const CONFIG = require('src/helpers/configLoader.js')

const errMsg = `
\`\`\`
Usage: ${CONFIG.prefix}h <id|name>

Example:

${CONFIG.command_prefix}h 4001
${CONFIG.command_prefix}h Poring Card
\`\`\`
`

const lookUpHistory = (msg, client) => {
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

module.exports = { lookUpHistory }