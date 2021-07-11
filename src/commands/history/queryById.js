const logger = require('logger')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const math = require('mathjs')
const { MessageEmbed, MessageAttachment } = require('discord.js')
const createCsvWriter = require('csv-writer').createArrayCsvWriter
const { execSync } = require('child_process')
const { table } = require('table')
const { writeFileSync, mkdirSync } = require("fs")

const queryById = async ({itemID, interaction, defer = true}) => {
  logger.info(`history id ${itemID}`)
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

  // Look for two tables:
  // 1) Vending Information
  // 2) Vending Price History
  let vendingInfoTable
  let vendingPriceHistoryTable
  h3Elements.each(function (i, elem) {
    if ($(this).text().match(/vending information/i)) vendingInfoTable = $(this).next().find('table')
    if ($(this).text().match(/vending price history/i)) vendingPriceHistoryTable = $(this).next().find('table')
  })

  // Scrape the price of current sales from Vending Information
  const arrayOfSales = []
  vendingInfoTable?.find('tbody').find('tr').each(function (i, elem) {
    const priceString = $(this).find('td.price').text().trim()
    const priceStringClean = priceString.trim().slice(0, -1).replace(/,/g, '').trim()
    const priceNumber = Number(priceStringClean)
    arrayOfSales.push(isNaN(priceNumber) ? 0 : priceNumber)
  })
  
  // Scrape the price of past sales from Vending Price History
  const arrOfPrices = []
  const arrToCsv = []
  const arrToTable = []
  vendingPriceHistoryTable?.find('tbody').find('tr').each(function (i, elem) {
    const priceString = $(this).find('td.price').text().trim()
    const priceStringClean = priceString.trim().slice(0, -1).replace(/,/g, '').trim()
    const priceNumber = Number(priceStringClean)

    const date = $(this).find('td').first().text().trim()
    const card1 = $(this).find('td').eq(2).text().trim()
    const card2 = $(this).find('td').eq(3).text().trim()
    const card3 = $(this).find('td').eq(4).text().trim()
    const card4 = $(this).find('td').eq(5).text().trim()
    const amount = $(this).find('td').last().text().trim()

    arrToTable.push([date, card1, card2, card3, card4, priceString, amount])
    arrToCsv.push([date.split(' ')[0], priceNumber])
    arrOfPrices.push(isNaN(priceNumber) ? 0 : priceNumber)
  })

  // Declare variabless that will be used to build the discord embed
  const itemName = h3Elements.first().text().trim()
  const thumbnailUrl = `https://www.shining-moon.com${$('table.vertical-table').first().find('img').attr('src')}` || `https://www.shining-moon.com/hel/themes/default/img/logo.gif`
  const lowestCurrentSale = (arrayOfSales[0])?.toLocaleString('en-US')
  const mean = arrOfPrices.length ? Math.floor(math.mean(arrOfPrices)).toLocaleString('en-US') : undefined
  const median = arrOfPrices.length ? Math.floor(math.median(arrOfPrices)).toLocaleString('en-US') : undefined
  const mode = arrOfPrices.length ? math.mode(arrOfPrices) : undefined
  const lowestPrice = arrOfPrices.length ? math.min(arrOfPrices).toLocaleString('en-US') : undefined
  const highestPrice = arrOfPrices.length ? math.max(arrOfPrices).toLocaleString('en-US') : undefined
  const highestFreqFromArr = arrOfPrices.reduce((acc, currentVal) => { return (currentVal == mode[0]) ? acc + 1 : acc } , 0)
  const highestFrequency = arrOfPrices.length ? highestFreqFromArr : undefined

  // Return error message if table not found
  if (!vendingPriceHistoryTable) {
    const embed = new MessageEmbed()
      .setTitle('Vending Price History table not found')
      .setURL(url)
      .setTimestamp()
      .setColor(16711680)
      .setThumbnail(thumbnailUrl)
      .setAuthor(itemName)

    return await interaction.editReply({ embeds: [embed] })
  }

  // Build csv
  mkdirSync('dump')
  const csvWriter = createCsvWriter({
    header: ['date', 'price'],
    path: 'dump/h_data.csv'
  })
  await csvWriter.writeRecords(arrToCsv.reverse())
  execSync(`python3 src/helpers/generate_history_plot.py ${median}`)

  // Build table
  const data = table(arrToTable)
  writeFileSync('dump/h_table.txt', data)

  const embed = new MessageEmbed()
    .setTitle('Vending Price History Summary')
    .setDescription(`Most recent 20 transactions`)
    .setURL(url)
    .setTimestamp()
    .setColor(15913595)
    .setFooter(`Requested by ${interaction.user.username}`)
    .setImage('attachment://h_plot.png')
    .setThumbnail(thumbnailUrl)
    .setAuthor(itemName)
    .addFields([
      {
        name: `Mean`,
         value: mean,
         inline: true
      },
      {
        name: `Median`,
         value: median,
         inline: true
      },
      {
        name: `Mode(s) | ${highestFrequency}/${arrOfPrices.length}`,
        value: mode.map(x => x.toLocaleString('en-US')).join('\n'),
      },
      {
        name: `Highest`,
        value: highestPrice,
        inline: true
      },
      {
        name: `Lowest`,
        value: lowestPrice,
        inline: true
      },
      {
        name: `Lowest CURRENT`,
        value: lowestCurrentSale ? lowestCurrentSale : 'N/A',
        inline: true
      },
    ])

  const attchTable = new MessageAttachment()
    .setFile('dump/h_table.txt')
  
  const attchPlot = new MessageAttachment()
    .setFile('dump/h_plot.png')

  await interaction.editReply({
    files: [attchTable, attchPlot], 
    embeds: [embed]
  })
}

module.exports = { queryById }