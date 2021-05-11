const {
    apiKeyBinance, apiSecretBinance
} = require('./constant.js')
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = '183576037:AAHQ-C1Cedke_qQw02do3g9OdnmodniZPHc'

const Binance = require('binance-api-node').default
const cron = require('node-cron')

const RSI = require('technicalindicators').RSI
const STOCHASTIC = require('technicalindicators').Stochastic
const BB = require('technicalindicators').BollingerBands

const SYMBOL = 'ETHUSDT'

const client = Binance({
    apiKey: apiKeyBinance,
    apiSecret: apiSecretBinance
})

const array = []

const bot = new TelegramBot(BOT_TOKEN, { polling: { autoStart: false } });

cron.schedule('*/5 * * * *', () => {  
    console.clear()
    console.log(new Date())

    client
        .futuresCandles({ symbol: SYMBOL, interval: '5m', limit: 500 })
        .then(data => {

            const close = data.map(d => d.close * 1)
            const low = data.map(d => d.low * 1)
            const high = data.map(d => d.high * 1)

            const RSI14 = RSI.calculate({
                values: close,
                period: 14
            })
            const STOCHASTIC533 = STOCHASTIC.calculate({
                period: 5,
                low: low,
                close: close,
                high: high,
                signalPeriod: 3
            })
            const BB202 = BB.calculate({
                period: 20,
                stdDev: 2,
                values: close
            })

            const FLAGRSI = RSI14[RSI14.length - 1] < 35
            const FLAGSTOCH = STOCHASTIC533[STOCHASTIC533.length - 1].k < 25
            const FLAGBB = BB202[BB202.length - 1].lower > close[close.length - 1]

            if (array.length >= 5) {
                array.shift()
                array.push({
                    close: close[close.length - 1],
                    FLAGRSI: FLAGRSI,
                    rsi: RSI14[RSI14.length - 1],
                    FLAGSTOCH: FLAGSTOCH,
                    stoch: STOCHASTIC533[STOCHASTIC533.length - 1].k,
                    FLAGBB: FLAGBB,
                    bb: BB202[BB202.length - 1].lower
                })
            } else {
                array.push({
                    close: close[close.length - 1],
                    FLAGRSI: FLAGRSI,
                    rsi: RSI14[RSI14.length - 1],
                    FLAGSTOCH: FLAGSTOCH,
                    stoch: STOCHASTIC533[STOCHASTIC533.length - 1].k,
                    FLAGBB: FLAGBB,
                    bb: BB202[BB202.length - 1].lower
                })
            }

            
            bot.sendMessage('@ethbbrsistoch', `
            ${new Date()}
            ETH – ${close[close.length - 1]}
            RSI - ${RSI14[RSI14.length - 1]}
            STOCH – ${STOCHASTIC533[STOCHASTIC533.length - 1].k}
            BB – ${BB202[BB202.length - 1].lower}
            ${FLAGBB && FLAGSTOCH && FLAGRSI ? '@gaserd' : 'NEUTRAL'}
            `)
            
        })
        .catch(e => console.log(e))
})
