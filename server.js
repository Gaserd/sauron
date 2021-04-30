const http = require('http')
const fs = require('fs')
const port = 3000

function createUpBlock() {
    let upBlock = `<html>
        <head>
            <meta charset="UTF-8">
            <title>Monitoring Crypto</title>
        </head>
        `

    return upBlock
}

function createMenu() {
    let menu = `
        <ul class="menu">
            <li><a href="/">Big PancakeSwap Transaction</a></li>
            <li><a href="/bfrsi">Binance Futures RSI</a></li>
        </ul>
    `
    return menu;
}

function createDownBlock() {
    let downBlock = '<p>Get feedback or questions? <a href="https://twitter.com/gaserdgg" target="_blank">Follow me @gaserdgg</a></p>'
    downBlock += `<style>
        * {
            font-family: monospace;
        }

        tr:hover {
            background: #dadae2;
        }

        .warning {
            background: palegreen;
        }

        .menu {
            padding: 0;
            margin: 0;
        }

        .menu li {
            display:inline-block;
            margin-right: 1em;
        }
    </style>`
    return downBlock
}


function createTableBFRSI(data) {

    let upBlock = createUpBlock() + ` 
        <body>
        ${createMenu()}
            <h1>Monitoring Binance Futures RSI Indicator</h1>`
    upBlock += '<p>we monitoring changes for all Binance Futures trading pairs for 1 min</p>'
    upBlock += '<p>pls refresh page if you want get new informations</p>'

    let table = '<table style="width:100%">'
    table += '<tr>'
    table += '<th>Symbol</th>'
    table += '<th>Price</th>'
    table += '<th>Change</th>'
    table += '<th>RSI</th>'
    table += '</tr>'
    for (let i = 0; i < data.length; i++) {
        table += '<tr>'
        table += `<td>${data[i].symbol}</td>`
        table += `<td>${data[i].prices[data[i].prices.length - 1]}</td>`
        table += `<td>${data[i].prevPrices}</td>`
        table += `<td>${data[i].rsi == null ? '' : data[i].rsi[data[i].rsi.length - 1]}</td>`
        table += '</tr>'
    }
    table += '</table>'

    let downBlock = createDownBlock() + `</body></html>`

    return upBlock + table + downBlock
}

function createTableSignals(data) {

    data = data.reverse()
    
    let upBlock = createUpBlock() + ` 
        <body>
        ${createMenu()}
            <h1>Monitoring PancakeSwap transactions</h1>`
    upBlock += '<p>we monitoring big transactions on PancakeSwap (more 25 BNB) and view last 50 this transactions</p>'
    upBlock += '<p>pls refresh page if you want get new transactions</p>'

    let table = '<table style="width:100%">'
    table += '<tr>'
    table += '<th>Hash</th>'
    table += '<th>Value (BNB)</th>'
    table += '<th>To</th>'
    table += '<th></th>'
    table += '<th>From</th>'
    table += '</tr>'
    for (let i = 0; i < data.length; i++) {
        table += '<tr>'
        table += `<td><a href="https://bscscan.com/tx/${data[i].hash}" target="_blank">${data[i].hash}</a></td>`
        table += `<td class="${(data[i].value / Math.pow(10, 18)) > 100 ? 'warning' : ''}">${(data[i].value / Math.pow(10, 18))}</td>`
        table += `<td>${data[i].transactionsNamesToken[0] ? data[i].transactionsNamesToken[0] : ''}</td>`
        table += `<td><b>-></b></td>`
        table += `<td>${data[i].transactionsNamesToken[1] ? data[i].transactionsNamesToken[1] : ''}</td>`
        table += '</tr>'
    }
    table += '</table>'

    let downBlock = createDownBlock() + `</body></html>`

    return upBlock + table + downBlock
}

const requestHandler = (request, response) => {
    console.log(request.url)
    if (request.url == '/') {
        const signals = fs.readFileSync('./signals.json')
        response.end(createTableSignals(JSON.parse(signals)))
    } else if(request.url == '/bfrsi') {
        const prices = fs.readFileSync('./prices.json')
        response.end(createTableBFRSI(JSON.parse(prices)))
    } else {
        response.end('')
    }
}
const server = http.createServer(requestHandler)
server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})