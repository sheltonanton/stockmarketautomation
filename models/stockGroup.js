const mongoose = require('mongoose')

const StockGroupSchema = mongoose.Schema({
    name: String,
    stocks: {
        type: mongoose.Schema.Types.DocumentArray,
        ref: 'Stock'
    }
})

module.exports = mongoose.model('StockGroup', StockGroupSchema);