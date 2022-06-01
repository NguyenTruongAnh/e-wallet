const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Account = new Schema(
    {
        username: { type: String, require: true },
        password: { type: String, require: true },
        isChangeDefaultPassword: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false },
        isBlock: { type: Boolean, default: false },
        status: { type: Number, default: 0 }, //0: chờ kích hoạt, 1: kích hoạt: 2 là yêu cầu bổ sung, 3:vô hiệu hóa
	    invalidLoginTime: {type: Number, default: 0},  //đăng nhập bất thường
        wrongPasswordTime: { type: Number, default: 0 }, //sai mật khẩu
        amount: { type: Number, default: 0 },
        blockTime: { type: Date }, // thời hạn hết khóa 1 phút
        blockDate: { type: Date }, // ngày khóa
        phone:{ type: String, unique: true },
        email:{ type: String, unique: true },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Account', Account)