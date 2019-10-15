const mongoose = require('mongoose')

const OrderSchema = mongoose.Schema({
    stock: String,
    quantity: Number,
    type: String,
    entryTime: String,
    entryPrice: Number,
    exitTime: String,
    exitPrice: Number
})

module.exports = mongoose.model('Order', OrderSchema);