const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Account = new Schema(
    {
        username: { type: String, require: true },
        password: { type: String, require: true },
        isChangeDefaultPassword: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        isBlock: { type: Boolean, default: false },
	    invalidLoginTime: {type: Number, default: 0},  //đăng nhập bất thường
        wrongPasswordTime: { type: Number, default: 0 }, //sai mật khẩu
        amount: { type: Number, default: 0 },
        phone:{ type: String }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Account', Account)
