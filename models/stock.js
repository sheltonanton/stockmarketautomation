const mongoose = require('mongoose')

const StockSchema = mongoose.Schema({
    name: String,
    instrumentId: String,
    details: Map
})

module.exports = mongoose.model('Stock', StockSchema);