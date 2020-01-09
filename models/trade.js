const mongoose = require('mongoose')

const TradeSchema = mongoose.Schema({
    name: String, //name of the trade
    price: Object, //price of trade, can be float, int or string (operation)
    quantity: Object, //quantity of trade, can be int or string (operation)
    target: Object, //target, can  float, array(func_constants) or string(operation)
    stoploss: Object, //stoploss, can be float, or string(operation)
    trader: String, //name of the trader
})

module.exports = mongoose.model('Trade', TradeSchema);