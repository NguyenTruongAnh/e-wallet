const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema(
    {
        name: { type: String, require: true },
        email: { type: String, require: true },
        phone: { type: String, required: true },
        birthday: { type: String, required: true },
        address: { type: String, required: true },
        imgFront: { type: String, require: true },
        imgBack: { type: String, require: true },

    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('User', User)