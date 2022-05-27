const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OTP = new Schema(
    {
        id: { type: String },
        otp: { type: String },
        createdAt: { type: Date },
        expiredAt: { type: Date }
    }
)

module.exports = mongoose.model('OTP', OTP)