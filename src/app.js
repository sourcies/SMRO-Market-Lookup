const discord = require('discord.js')
const { handleCommand } = require('src/helpers/commandHandler.js')
const logger = require('logger')
const CONFIG = require('src/helpers/configLoader.js')

const client = new discord.Client()

client.on('message', (msg) => {
  if (msg.author.bot) return
  if (!msg.content.startsWith(CONFIG.command_prefix)) return
  return handleCommand(msg, client)
})

client.on('ready', () => {
  logger.success('Logged in!')
})

try {
  client.login(CONFIG.token)
}
catch (e) {
  logger.error(e)
}
