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


function getIntervalPrices(prices, interval) {
    //interval - minutes
    let arr = []
    for (let i = 0; i < prices.length; i++) {
        if (i % interval == 0) arr.push(prices[i])
    }
    return arr
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

                    if (oldPrices[i].prices.length >= 600) {
                        oldPrices[i].prices.shift()
                        oldPrices[i].prices.push(prices[j])
                    } else {
                        oldPrices[i].prices.push(prices[j])
                    }

                    const inputRSI = {
                        values : oldPrices[i].prices,
                        period : 7
                    };

                    const inputRSI5 = {
                        values: getIntervalPrices(oldPrices[i].prices, 5),
                        period: 7
                    }

                    const inputRSI15 = {
                        values: getIntervalPrices(oldPrices[i].prices, 15),
                        period: 7
                    }




                    oldPrices[i].rsi = RSI.calculate(inputRSI)
                    oldPrices[i].rsi5 = RSI.calculate(inputRSI5)
                    oldPrices[i].rsi15 = RSI.calculate(inputRSI15)
                    

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
