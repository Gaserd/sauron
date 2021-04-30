const {
    apiKeyBinance, apiSecretBinance
} = require('./constant.js')
const Binance = require('binance-api-node').default
const fs = require('fs')
const RSI = require('technicalindicators').RSI
cron = require('node-cron')

const client = Binance({
    apiKey: apiKeyBinance,
    apiSecret: apiSecretBinance
})


function getPrices() {
    return client.futuresPrices().then(data => data).catch(e => [])
}


function save(prices) {
    let oldPrices = JSON.parse(fs.readFileSync('./prices.json'))

    if (oldPrices.length == 0) {
        let array = []
        for (let i in prices) {
            array.push({
                symbol: i,
                prices: [prices[i]],
                rsi: null,
                prevPrices: null
            })
        }
        fs.writeFileSync('./prices.json', JSON.stringify(array))
    } else {
        for (let i = 0; i < oldPrices.length; i++) {
            const symbol = oldPrices[i].symbol
            for (let j in prices) {
                const pricesSymbol = j

                if (symbol == pricesSymbol) {

                    if (oldPrices[i].prices[oldPrices[i].prices.length - 1] > prices[j]) {
                        oldPrices[i].prevPrices = 'DOWN'
                    } else {
                        oldPrices[i].prevPrices = 'UP'
                    }

                    if (oldPrices[i].prices.length >= 60) {
                        oldPrices[i].prices.shift()
                        oldPrices[i].prices.push(prices[j])
                    } else {
                        oldPrices[i].prices.push(prices[j])
                    }

                    const inputRSI = {
                        values : oldPrices[i].prices,
                        period : 7
                    };

                    oldPrices[i].rsi = RSI.calculate(inputRSI)

                }
            }
        }

        fs.writeFileSync('./prices.json', JSON.stringify(oldPrices))
    }

}

cron.schedule('*/1 * * * *', () => {
    console.log(new Date() + ' start task 1 min -> ')
    getPrices()
    .then(
        data => save(data)
    )
    .catch(e => console.log(e))
});
