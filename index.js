
const Web3 = require('web3')
const web3 = new Web3('https://bsc-dataseed1.binance.org:443')
const fs = require('fs')

const address = JSON.parse(fs.readFileSync('./bsctokens.json'))


function getNameTokenByAddress(as) {
    let result = null
    for (let i = 0; i < address.length; i++) {
        if (address[i].address == +as) {
            result = address[i]
        }
    }
    return result
}

async function getBlockNumber() {
    return new Promise(function (resolve, reject) {
        web3
            .eth
            .getBlockNumber()
            .then(number => {
                resolve(number)
            })
            .catch(e => {
                console.log(e)
                reject(null)
            })
    })
}

async function getBlock(number) {
    web3
        .eth
        .getBlock(number)
        .then(data => {
            console.log('last block in blockchain - ' + number)
            if (data.transactions.length > 0) {
                const transactions = data.transactions
                console.log('transactions in block - ' + transactions.length)
                for (let i = 0; i < transactions.length; i++) {
                    setTimeout(function () {
                        getTransaction(transactions[i])
                    }, 300 * i)
                }
            }
        })
}

async function getTransaction(hash) {
    web3
        .eth
        .getTransaction(hash)
        .then(data => {
            const value = (data.value != 0) ? data.value / Math.pow(10, 18) : 0
            //value = 1 BNB
            if (value != 0 && value > 25 && data.to === '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F') {
                console.log(data.hash, value)
                data.transactionsNamesToken = []
                web3.eth.getTransactionReceipt(data.hash)
                    .then(res => {
                        if (res.status) {
                            let names = []
                            for (let i = 0; i < res.logs.length; i++) {
                                let addrr = res.logs[i].address
                                let name = getNameTokenByAddress(addrr)

                                if (name != null) {
                                    if (names.indexOf(name.text) == -1) {
                                        names.push(name.text)
                                    }
                                }
                            }
                            data.transactionsNamesToken = names
                            saveSignals(data)
                        }
                    })
                    .catch(e => {
                        console.log(e)
                    })
            }
        })
        .catch(e => {

        })
}

async function saveSignals(data) {
    let signals = JSON.parse(fs.readFileSync('./signals.json'));
    if (signals.length < 50) {
        signals.push(data)
        fs.writeFileSync('./signals.json', JSON.stringify(signals))
    } else {
        signals = signals.slice(signals.length - 50, signals.length)
        signals.push(data)
        fs.writeFileSync('./signals.json', JSON.stringify(signals))
    }
}

let arrayBlockNumber = []


setInterval(() => {
    getBlockNumber()
        .then(number => {
            if (arrayBlockNumber.indexOf(number) == -1) {
                getBlock(number)

                if (arrayBlockNumber.length < 50) {
                    arrayBlockNumber.push(number)
                } else {
                    arrayBlockNumber.shift()
                    arrayBlockNumber.push(number)
                }
            }
        })
}, 3000);

//среднее время завершения блока 4 секунды