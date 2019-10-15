const mongoose = require('mongoose')

const PropertySchema = mongoose.Schema({
    key: String,
    value: String
})

module.exports = mongoose.model('Property', PropertySchema);