const mongoose = require('mongoose')

const StrategySchema = mongoose.Schema({
    name: String, //strategy name
    token: String,//token of stock
    stock: String, //name of stock
    operation: String, //operation string
    beginOn: String, //condition for beginning the strategy of first true
    endOn: String, //condition for ending the strategy of first true
    type: String, //buy or sell
    counter: String, //id of the counter strategy, can be null
    trades: Array, //specifying the list of traders id
    status: String //on or off for trading
})

module.exports = mongoose.model('Strategy', StrategySchema);