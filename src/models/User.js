const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: 'Email is required'
    },
    password: {
        type: String,
        required: 'Password is required'
    },
    role: {
        type: String
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String
    },
    phone: {
        type: String
    },
    city: {
        type: String
    }
})

module.exports = mongoose.model('User', userSchema)