const logger = require('logger')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const { MessageEmbed, MessageSelectMenu } = require('discord.js')
const { queryById } = require('src/commands/history/queryById.js')

const queryByName = async ({itemName, interaction}) => {
  logger.info(`history name ${itemName}`)
  await interaction.defer()

  const url = `https://www.shining-moon.com/hel/?module=item&name=${encodeURI(itemName)}&script=&type=-1&equip_loc=-1&npc_buy_op=eq&npc_buy=&npc_sell_op=eq&npc_sell=&weight_op=eq&weight=&range_op=eq&range=&slots_op=eq&slots=&defense_op=eq&defense=&attack_op=eq&attack=&matk_op=eq&matk=&refineable=&for_sale=&custom=`
  const response = await fetch(url)
  const body = await response.text()

  const $ = cheerio.load(body)

  // Return error message if no item was found
  if ($('table').length === 0) {
    const embed = new MessageEmbed()
      .setTitle('No item found with that name')
      .setColor(16711680)
      .setTimestamp()

    return await interaction.editReply({ embeds: [embed] })
  }
  
  // If only one result when querying by name, query by ID right away
  // One result meanss 2 <tr> because header of table is included
  if ($('tr').length === 2) {
    const itemID = $('tr').eq(1).find('td').eq(0).text().replace(/\n/g, '').trim()
    return queryById({ itemID, interaction, defer: false })
  }

  const options = []
  $('tr').each(function (i, elem) {
    if (i === 0) return
    
    const itemID = $(this).find('td').eq(0).text().replace(/\n/g, '').trim()
    let itemName = undefined
    if ($(this).find('td').length === 16) itemName = $(this).find('td').eq(2).text().replace(/\n/g, '').trim()
    else itemName = $(this).find('td').eq(1).text().replace(/\n/g, '').trim()
    
    options.push({
      label: itemID, 
      description: itemName.slice(0,50), // Description must be 50 or fewer in length
      value: itemID
    })
  })
  
  const menu = new MessageSelectMenu()
    .setCustomId('select')
    .setPlaceholder('Please select an item')
    .addOptions(options)
  
  const msg = await interaction.editReply({ content: '** **', components: [[menu]] })
  const filter = itr => itr.user.id === interaction.user.id
  const selectMenuItr = await msg.awaitMessageComponent(filter)
  await selectMenuItr.update({ content: `Looking up \`${selectMenuItr.values[0]}\`...`, components: [] })

  queryById({ itemID: selectMenuItr.values[0], interaction, defer: false })
}

module.exports = { queryByName }