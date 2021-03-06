const mongoose = require('mongoose')

const OrderSchema = mongoose.Schema({
    orderId: String,
    stock: String,
    quantity: Number,
    type: String,
    entryTime: String,
    entryPrice: Number,
    exitTime: String,
    exitPrice: Number,
    comments: String,
    strategy: String,
    trades: Array
})

module.exports = mongoose.model('Order', OrderSchema);