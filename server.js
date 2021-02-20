const http = require('http')
const fs = require('fs')
const port = 3000

function createTableSignals(data) {

    data = data.reverse()

    let upBlock = '<h1>Monitoring PancakeSwap transactions</h1>'
    upBlock += '<p>we monitoring big transactions on PancakeSwap (more 25 BNB) and view last 50 this transactions</p>'
    upBlock += '<p>pls refresh page if you want get new transactions</p>'

    let table = '<table>'
    table += '<tr>'
    table += '<th>Hash</th>'
    table += '<th>Value (BNB)</th>'
    table += '</tr>'
    for (let i = 0; i < data.length; i++) {
        table += '<tr>'
        table += `<td><a href="https://bscscan.com/tx/${data[i].hash}" target="_blank">${data[i].hash}</a></td>`
        table += `<td>${(data[i].value / Math.pow(10, 18))}</td>`
        table += '</tr>'
    }
    table += '</table>'

    let downBlock = '<p>Get feedback or questions? <a href="https://twitter.com/gaserdgg" target="_blank">Follow me @gaserdgg</a></p>'
    downBlock += `<style>
        * {
            font-family: monospace;
        }
    </style>`

    return upBlock + table + downBlock
}

const requestHandler = (request, response) => {
    console.log(request.url)
    if (request.url == '/') {
        const signals = fs.readFileSync('./signals.json')
        response.end(createTableSignals(JSON.parse(signals)))
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