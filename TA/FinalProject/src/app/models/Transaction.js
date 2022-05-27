const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Transaction = new Schema(
    {
        type: { type: Number, required: true }, // 0: nạp tiền, 1: rút tiền, 2: chuyển tiền, 3: mua thẻ đt 
        idCard: { type: String },  // Mã thẻ tín dụng
        amount: { type: Number, required: true },
        note: { type: String },
        fee: { type: Number, default: 0 }, // Phí giao dịch
        typeCardPhone: { type: Number }, // 10.000, 20.000, 50.000, 100.000 vnd
        numberCardPhone: { type: Number},
        nameCardPhone: { type: String }, // Viettel, mobifone, vinaphone
        cardPhoneList: [ String ], // Danh sách mã thẻ
        status: { type: Number }, // 0: xác nhận, 1: từ chối, 2: chờ xác nhận, 3: chờ xác thực otp
        senderPhone: { type: String }, // Sđt người gửi
        receiverPhone: { type: String }, // Sđt người nhận
        whoPayFee: { type: Number }, // 0: người gửi trả, 1: người nhận trả
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Transaction', Transaction)