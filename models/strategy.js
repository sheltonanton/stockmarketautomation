const mongoose = require('mongoose')

const StrategySchema = mongoose.Schema({
    name: String, //strategy name
    operation: String, //operation string
    beginOn: String, //condition for beginning the strategy of first true
    endOn: String, //condition for ending the strategy of first true
    type: String //buy or sell
})

module.exports = mongoose.model('Strategy', StrategySchema);