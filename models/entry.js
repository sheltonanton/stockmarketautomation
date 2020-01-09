const mongoose = require("mongoose")

const EntrySchema = mongoose.Schema({
    name: String,
    strategy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strategy'
    },
    trade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trade'
    },
    stock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock'
    },
    counter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strategy'
    },
    status: String
})

module.exports = mongoose.model('Entry', EntrySchema);