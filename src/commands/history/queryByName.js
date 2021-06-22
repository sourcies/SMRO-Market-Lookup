const logger = require('logger')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { queryById } = require('src/commands/history/queryById.js')

const queryByName = async ({itemName, interaction}) => {
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

  // Build action rows with buttons
  const actionRow1 = new MessageActionRow()
  const actionRow2 = new MessageActionRow()
  const actionRow3 = new MessageActionRow()
  const actionRow4 = new MessageActionRow()
  const actionRow5 = new MessageActionRow()

  $('tr').each(function (i, elem) {
    if (i === 0) return

    const itemID = $(this).find('td').eq(0).text().replace(/\n/g, '').trim()
    let itemName = undefined
    if ($(this).find('td').length === 16) itemName = $(this).find('td').eq(2).text().replace(/\n/g, '').trim()
    else itemName = $(this).find('td').eq(1).text().replace(/\n/g, '').trim()

    const btn = new MessageButton()
      .setCustomID(itemID)
      .setLabel(`${itemID}: ${itemName}`)
      .setStyle('PRIMARY')

    if (i >= 0 && i <= 4) actionRow1.addComponents(btn)
    if (i >= 5 && i <= 9) actionRow2.addComponents(btn)
    if (i >= 10 && i <= 14) actionRow3.addComponents(btn)
    if (i >= 15 && i <= 19) actionRow4.addComponents(btn)
    if (i >= 20 && i <= 24) actionRow5.addComponents(btn)
  })
    
  const embed = new MessageEmbed()
    .setTitle(`Please select an item`)
    .setURL(url)
    .setTimestamp()
    .setColor(15913595)
    .setFooter(`Requested by ${interaction.user.username}`)

  const actionRows = []
  if (actionRow1.components.length != 0) actionRows.push(actionRow1)
  if (actionRow2.components.length != 0) actionRows.push(actionRow2)
  if (actionRow3.components.length != 0) actionRows.push(actionRow3)
  if (actionRow4.components.length != 0) actionRows.push(actionRow4)
  if (actionRow5.components.length != 0) actionRows.push(actionRow5)

  const msg = await interaction.editReply({ embeds: [embed], components: actionRows })

  const filter = itr => itr.user.id === interaction.user.id
  const itrBtn = await msg.awaitMessageComponentInteraction(filter)

  queryById({ itemID: itrBtn.customID, interaction: itrBtn })
}

module.exports = { queryByName }