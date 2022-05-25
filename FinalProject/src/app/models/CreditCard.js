const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CreditCard = new Schema(
    {
        idCard: { type: String, required: true },
        expireDate: { type: String, required: true },
        cvv: {type: String, required: true},
    },
)

module.exports = mongoose.model('CreditCard', CreditCard)