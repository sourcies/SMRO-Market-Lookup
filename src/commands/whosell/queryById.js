const fetch = require('node-fetch')
const cheerio = require('cheerio')
const { MessageEmbed, MessageAttachment } = require('discord.js')
const createCsvWriter = require('csv-writer').createArrayCsvWriter
const { execSync } = require('child_process')
const { table } = require('table')
const { writeFileSync } = require("fs")

const queryById = async ({ itemID, interaction, defer = true }) => {
  if (defer) await interaction.defer()

  const url = `https://www.shining-moon.com/hel/?module=item&action=view&id=${itemID}&price_order=asc&name_japanese_order=none&date_order=desc`
  const response = await fetch(url)
  const body = await response.text()

  const $ = cheerio.load(body)
  
  // Return error message if invalid id
  if ($('div.adjust').length === 0) {
    const embed = new MessageEmbed()
      .setTitle('Invaild ID')
      .setColor(16711680)
      .setTimestamp()

    return await interaction.editReply({ embeds: [embed] })
  }

  const h3Elements = $('h3')

  // Look for one table:
  // 1) Vending Information
  let vendingInfoTable
  h3Elements.each(function (i, elem) {
    if ($(this).text().match(/vending information/i)) vendingInfoTable = $(this).next().find('table')
  })

  // Declare variabless that will be used to build the discord embed
  const itemName = h3Elements.first().text().trim()
  const thumbnailUrl = `https://www.shining-moon.com${$('table.vertical-table').first().find('img').attr('src')}` || `https://www.shining-moon.com/hel/themes/default/img/logo.gif`
  
  // Return error message if table not found
  if (!vendingInfoTable) {
    const embed = new MessageEmbed()
      .setTitle('Vending Information table not found')
      .setURL(url)
      .setTimestamp()
      .setColor(16711680)
      .setThumbnail(thumbnailUrl)
      .setAuthor(itemName)

    return await interaction.editReply({ embeds: [embed] })
  }
  
  // Scrape the price of current sales from Vending Information
  const arrayOfSales = []
  const arrToCsv = []
  const arrToTable = [['C0', 'C1', 'C2', 'C3', 'Price', 'Amt']]
  vendingInfoTable?.find('tbody').find('tr').each(function (i, elem) {
    const priceString = $(this).find('td.price').text().trim()
    const priceStringClean = priceString.trim().slice(0, -1).replace(/,/g, '').trim()
    const priceNumber = Number(priceStringClean)

    const c0 = $(this).find('td').eq(3).text().trim()
    const c1 = $(this).find('td').eq(4).text().trim()
    const c2 = $(this).find('td').eq(5).text().trim()
    const c3 = $(this).find('td').eq(6).text().trim()
    const amount = $(this).find('td').eq(8).text().trim()
    
    arrayOfSales.push(isNaN(priceNumber) ? 0 : priceNumber)
    arrToTable.push([c0, c1, c2, c3, priceString, amount])
    arrToCsv.push([priceString])
  })

  // If there are 2 or more pages, scrape them too
  const numOfPages = $('a.page-num').length
  if (numOfPages >= 2) {
    for (let i = 2; i <= numOfPages; i++) {
      const response = await fetch(`${url}&p=${i}`)
      const body = await response.text()
      const $ = cheerio.load(body)

      const h3Elements = $('h3')

      let vendingInfoTable
      h3Elements.each(function (i, elem) {
        if ($(this).text().match(/vending information/i)) vendingInfoTable = $(this).next().find('table')
      })

      vendingInfoTable?.find('tbody').find('tr').each(function (i, elem) {
        const priceString = $(this).find('td.price').text().trim()
        const priceStringClean = priceString.trim().slice(0, -1).replace(/,/g, '').trim()
        const priceNumber = Number(priceStringClean)

        const c0 = $(this).find('td').eq(3).text().trim()
        const c1 = $(this).find('td').eq(4).text().trim()
        const c2 = $(this).find('td').eq(5).text().trim()
        const c3 = $(this).find('td').eq(6).text().trim()
        const amount = $(this).find('td').eq(8).text().trim()
        
        arrayOfSales.push(isNaN(priceNumber) ? 0 : priceNumber)
        arrToTable.push([c0, c1, c2, c3, priceString, amount])
        arrToCsv.push([priceString])
      })
    }
  }
  
  // Build csv
  const csvWriter = createCsvWriter({
    header: ['price'],
    path: 'dump/ws_data.csv'
  })
  await csvWriter.writeRecords(arrToCsv)
  execSync(`python3 src/helpers/generate_sales_plot.py`)
  
  // Build table
  const data = table(arrToTable)
  writeFileSync('dump/ws_table.txt', data)

  const embed = new MessageEmbed()
    .setTitle('Vending Information Summary')
    .setDescription(`Ascending order by **Price**`)
    .setURL(url)
    .setTimestamp()
    .setColor(15913595)
    .setFooter(`Requested by ${interaction.user.username}`)
    .setImage('attachment://ws_plot.png')
    .setThumbnail(thumbnailUrl)
    .setAuthor(itemName)
    .addFields(
      {
        name: `Lowest sale`,
        value: (arrayOfSales[0])?.toLocaleString('en-US'),
        inline: true
      },
      {
        name: `Highest sale`,
        value: (arrayOfSales[arrayOfSales.length-1])?.toLocaleString('en-US'),
        inline: true
      },
      {
        name: `Total number of vendors`,
        value: arrayOfSales.length.toString()
      }
    )

  const attchTable = new MessageAttachment()
    .setFile('dump/ws_table.txt')

  const attchPlot = new MessageAttachment()
    .setFile('dump/ws_plot.png')

  await interaction.editReply({
    files: [attchTable, attchPlot],
    embeds: [embed]
  })
}

module.exports = { queryById }