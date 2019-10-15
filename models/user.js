const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    userId: String,
    password: String,
    pin: String,
    master: Boolean
})

module.exports = mongoose.model('User', UserSchema);