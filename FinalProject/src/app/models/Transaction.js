const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Transaction = new Schema(
    {
        type: { type: String, required: true },
        idCard: { type: String, required: true },
        expireDate: { type: String, required: true },
        amount: { type: Number, required: true },
        note: { type: String },
        fee: { type: Number, default: 0 },
        typeCardPhone: { type: Number},
        numberCardPhone: { type: Number},
        phone: { type: String },
        status: {type: String,default:'approved'} //approved, pending, declined
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Transaction', Transaction)