const logger = require('logger')

const queryByName = (arg, msg) => {
  logger.debug(arg)
  logger.debug(msg.content)
}

module.exports = { queryByName }