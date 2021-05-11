const logger = require('logger')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const discord = require('discord.js')
const { queryById } = require('src/commands/whosell/queryById.js')
const { counterToEmoji, emojiToCounter } = require('src/helpers/converter.js')

const queryByName = async (arg, msg, client) => {
  const url = `https://www.shining-moon.com/hel/?module=item&name=${encodeURI(arg)}&script=&type=-1&equip_loc=-1&npc_buy_op=eq&npc_buy=&npc_sell_op=eq&npc_sell=&weight_op=eq&weight=&range_op=eq&range=&slots_op=eq&slots=&defense_op=eq&defense=&attack_op=eq&attack=&matk_op=eq&matk=&refineable=&for_sale=&custom=`
  const response = await fetch(url)
  const body = await response.text()

  const $ = cheerio.load(body)

  // Return error message if no item was found
  if ($('table').length === 0) {
    const embed = new discord.MessageEmbed()
      .setTitle('No item found with that name')
      .setColor(16711680)
      .setTimestamp()

    return msg.reply(embed)
  }

  // If only one result when querying by name, query by ID right away
  if ($('tr').length === 1) {
    const itemID = mapOfIDAndName.keys().next().value
    return queryById(itemID, msg)
  }

  // Creating a map for the item id and item name
  const mapOfIDAndName = new Map()
  $('tr').each(function (i, elem) {
    if (i > 10) return
    if (i !== 0) {
      const itemID = $(this).find('td').eq(0).text().replace(/\n/g, '').trim()
      let itemName = undefined
      if ($(this).find('td').length === 16) itemName = $(this).find('td').eq(2).text().replace(/\n/g, '').trim()
      else itemName = $(this).find('td').eq(1).text().replace(/\n/g, '').trim()
      mapOfIDAndName.set(itemID, itemName)
    }
  })

  // Building the message to be sent
  let description = ``
  let counter = 1
  const mapOfReactAndID = new Map()
  for (const [key, value] of mapOfIDAndName) {
    description += `${counterToEmoji(counter)} ${key} => ${value}\n\n`
    mapOfReactAndID.set(counter, key)
    counter++
  }

  const embed = new discord.MessageEmbed()
    .setTitle(`React to select`)
    .setDescription(description)
    .setURL(url)
    .setTimestamp()
    .setColor(15913595)
    .setFooter(`Requested by ${msg.author.tag}`)

  const sentMessage = await msg.reply(embed)

  // React to the sentMessagee
  for (let counter = 1; counter <= mapOfIDAndName.size; counter++) {
    const emojiString = counterToEmoji(counter)
    await sentMessage.react(emojiString)
  }

  // Listen once for the reaction
  client.once('messageReactionAdd', (messageReaction, user) => {
    if (messageReaction.message.id === sentMessage.id && user.id === msg.author.id) {
      const counter = emojiToCounter(messageReaction.emoji.name)
      if (counter <= 10) {
        const itemID = mapOfReactAndID.get(counter)
        logger.debug(`${user.tag} reacted with ${counter} => ${itemID}`)
        queryById(itemID, msg)
      }
    }
  })
}

module.exports = { queryByName }