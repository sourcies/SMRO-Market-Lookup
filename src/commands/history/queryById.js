const logger = require("logger")
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const math = require('mathjs')
const discord = require('discord.js')
const createCsvWriter = require('csv-writer').createArrayCsvWriter
const { execSync } = require('child_process')
const { table } = require('table')
const { writeFileSync } = require("fs")

const queryById = async (arg, msg) => {
  const url = `https://www.shining-moon.com/hel/?module=item&action=view&id=${arg}&price_order=asc&name_japanese_order=none&date_order=desc`
  const response = await fetch(url)
  const body = await response.text()

  const $ = cheerio.load(body)
  if ($('div.adjust').length === 0) return msg.reply('Invalid ID')

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
    const priceString = $(this).find('td.price').text()
    const priceStringClean = priceString.trim().slice(0, -1).replace(/,/g, '').trim()
    const priceNumber = Number(priceStringClean)
    arrayOfSales.push(isNaN(priceNumber) ? 0 : priceNumber)
  })
  
  // Scrape the price of past sales from Vending Price History
  const arrOfPrices = []
  const arrToCsv = []
  vendingPriceHistoryTable?.find('tbody').find('tr').each(function (i, elem) {
    const priceString = $(this).find('td.price').text()
    const priceStringClean = priceString.trim().slice(0, -1).replace(/,/g, '').trim()
    const priceNumber = Number(priceStringClean)

    const date = $(this).find('td').first().text().trim()
    const card1 = $(this).find('td').eq(2).text().trim()
    const card2 = $(this).find('td').eq(3).text().trim()
    const card3 = $(this).find('td').eq(4).text().trim()
    const card4 = $(this).find('td').eq(5).text().trim()
    const amount = $(this).find('td').last().text().trim()

    arrToCsv.push([date, card1, card2, card3, card4, priceNumber.toLocaleString('en-US'), amount])
    arrTo
    arrOfPrices.push(isNaN(priceNumber) ? 0 : priceNumber)
  })

  // Declare variabless that will be used to build the discord embed
  const itemName = h3Elements.first().text().trim()
  const thumbnailUrl = `https://www.shining-moon.com${$('table.vertical-table').first().find('img').attr('src')}` || `https://www.shining-moon.com/hel/themes/default/img/logo.gif`
  const lowestCurrentSale = (arrayOfSales[0])?.toLocaleString('en-US')
  const dateTo = vendingPriceHistoryTable?.find('tbody').find('tr').first().find('td').first().text()
  const dateFrom = vendingPriceHistoryTable?.find('tbody').find('tr').last().find('td').first().text()
  const mean = arrOfPrices.length ? math.mean(arrOfPrices).toLocaleString('en-US') : undefined
  const median = arrOfPrices.length ? math.median(arrOfPrices).toLocaleString('en-US') : undefined
  const mode = arrOfPrices.length ? math.mode(arrOfPrices) : undefined
  const lowestPrice = arrOfPrices.length ? math.min(arrOfPrices).toLocaleString('en-US') : undefined
  const highestPrice = arrOfPrices.length ? math.max(arrOfPrices).toLocaleString('en-US') : undefined
  const highestFreqFromArr = arrOfPrices.reduce((acc, currentVal) => { return (currentVal == mode[0]) ? acc + 1 : acc } , 0)
  const highestFrequency = arrOfPrices.length ? highestFreqFromArr : undefined

  if (!vendingPriceHistoryTable) {
    const embed = new discord.MessageEmbed()
      .setTitle('Vending Price History table not found')
      .setURL(url)
      .setTimestamp()
      .setColor(16711680)
      .setThumbnail(thumbnailUrl)
      .setAuthor(itemName)

    return msg.reply(embed)
  }

  // Build table
  // const csvWriter = createCsvWriter({
  //   header: ['date', 'card1', 'card2', 'card3', 'card4', 'price', 'amount'],
  //   path: 'data.csv'
  // })
  // await csvWriter.writeRecords(arrToCsv)
  // execSync('python3 src/helpers/generateTable.py')

  const data = table(arrToCsv, { singleLine: true })
  writeFileSync('table.txt', data)

  const embed = new discord.MessageEmbed()
    .setTitle('Vending Price History Summary')
    .setURL(url)
    .setTimestamp()
    .setColor(15913595)
    .attachFiles('table.txt')
    // .attachFiles('vendingPriceHistory.jpg')
    // .setImage('attachment://vendingPriceHistory.jpg')
    .setThumbnail(thumbnailUrl)
    .setAuthor(itemName)
    .addFields(
      {
        name: 'Requested by',
        value: `<@${msg.author.id}>`
      },
      {
        name: `Mean`,
        value: mean ? mean : 'Unavailable',
      },
      {
        name: `Median`,
        value: median ? median : 'Unavailable',
      },
      {
        name: mode ? `Mode(s) | Highest frequency: ${highestFrequency} | Number of prices: ${arrOfPrices.length}` : `Mode(s)`,
        value: mode ? mode : 'Unavailable',
      },
      {
        name: `Lowest Price`,
        value: lowestPrice ? lowestPrice : 'Unavailable',
        inline: true
      },
      {
        name: `Highest Price`,
        value: highestPrice ? highestPrice : 'Unavailable',
        inline: true
      },
      {
        name: `Lowest current sale`,
        value: lowestCurrentSale ? lowestCurrentSale : 'Unavailable',
      },
      {
        name: `Date from`,
        value: dateFrom ? dateFrom : 'Unavailable',
        inline: true
      },
      {
        name: `Date to`,
        value: dateTo ? dateTo : 'Unavailable',
        inline: true
      }
    )

  await msg.channel.send(embed);
}

module.exports = { queryById }