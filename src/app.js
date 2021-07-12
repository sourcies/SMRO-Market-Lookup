const logger = require('@wizo06/logger')
const CONFIG = require('src/helpers/configLoader.js')
const { Client, Intents } = require('discord.js')

const { queryById: historyById } = require('src/commands/history/queryById.js')
const { queryByName: historyByName } = require('src/commands/history/queryByName.js')
const { queryById: whosellById } = require('src/commands/whosell/queryById.js')
const { queryByName: whosellByName } = require('src/commands/whosell/queryByName.js')

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

client.on('ready', () => {
  logger.success(`Logged in as ${client.user.tag}!`)
})

client.on('message', async msg => {
  if (msg.content.startsWith('!h') ||
      msg.content.startsWith('!history') ||
      msg.content.startsWith('!ws') ||
      msg.content.startsWith('!whosell')) {
    await msg.reply('Command is deprecated. Please use *slash* command by typing `/`.')
  }
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return

  if (interaction.commandName === 'history' && interaction.options.get('id')) {
    const itemID = interaction.options.get('id').options.get('id').value
    historyById({itemID, interaction})
    return
  }
  
  if (interaction.commandName === 'history' && interaction.options.get('name')) {
    const itemName = interaction.options.get('name').options.get('name').value
    historyByName({itemName, interaction})
    return
  }

  if (interaction.commandName === 'whosell' && interaction.options.get('id')) {
    const itemID = interaction.options.get('id').options.get('id').value
    whosellById({itemID, interaction})
    return
  }

  if (interaction.commandName === 'whosell' && interaction.options.get('name')) {
    const itemName = interaction.options.get('name').options.get('name').value
    whosellByName({itemName, interaction})
    return
  }

})

client.login(CONFIG.token)