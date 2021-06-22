(async () => {
  try {
    const { Client, Intents } = require('discord.js')
    const logger = require('logger')
    const CONFIG = require('src/helpers/configLoader.js')

    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
    await client.login(CONFIG.token)
    
    const history = {
      name: 'history',
      description: 'Display the history of sales for an item',
      options: [
        {
          name: 'id',
          description: 'Display the history of sales for an item by ID',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'id',
              description: 'ID of an item',
              type: 'INTEGER',
              required: true
            }
          ]
        },
        {
          name: 'name',
          description: 'Display the history of sales for an item by name',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'name',
              description: 'Name of an item',
              type: 'STRING',
              required: true
            }
          ]
        }
      ]
    }

    const whosell = {
      name: 'whosell',
      description: 'Display the current sales for an item',
      options: [
        {
          name: 'id',
          description: 'Display the current sales for an item by ID',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'id',
              description: 'ID of an item',
              type: 'INTEGER',
              required: true
            }
          ]
        },
        {
          name: 'name',
          description: 'Display the current sales for an item by name',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'name',
              description: 'Name of an item',
              type: 'STRING',
              required: true
            }
          ]
        }
      ]
    }
  
    await client.application.commands.create(history)
    logger.success('history command created')
    await client.application.commands.create(whosell)
    logger.success('whosell command created')

    await client.destroy()
  }
  catch (e) {
    console.log(e)
  }
})()