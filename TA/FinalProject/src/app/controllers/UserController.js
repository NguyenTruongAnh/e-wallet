const Account = require('../models/Account')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const OTP = require('../models/OTP')
const CreditCard = require('../models/CreditCard')
const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose')
const { formatResponse } = require('../../util/response')
const fs = require('fs')
const path = require('path')
const { createRandomString, createRandomNumber } = require('../../lib/random')
const bcrypt = require('bcrypt')
const transporter = require('../../config/mail/transporter')
const moment = require('moment')

// Format tiền về tiền Việt
const formatter = new Intl.NumberFormat('vi-VN')

class UserController {

    // [GET] /card
    getCard(req, res, next) {
        res.render('user/card.hbs', { layout: 'userLayout' })
    }

    // [POST] /card
    async postCard(req, res, next) {
        const name = req.body.name
        const type = parseInt(req.body.type)
        const number = parseInt(req.body.number)
        const { _id, amount, phone } = req.session.account
        const totalPayment = type * number // Tổng tiền thẻ cào

        if (amount >= totalPayment) {
            let cardNetworkCode = '11111' // Mã nhà mạng, mặc định là 1111 của Viettel
            let cardPhoneList = []

            if (name.toLowerCase() === 'mobifone') {
                cardNetworkCode = '22222'
            }

            if (name.toLowerCase() === 'vinaphone') {
                cardNetworkCode = '33333'
            }

            for (let i = 0; i < number; i++) {
                cardPhoneList.push(cardNetworkCode + createRandomNumber(5))
            }

            // Cập nhật lại số dư tài khoản người dùng
            const account = await Account.findById(_id)

            account.amount = account.amount - totalPayment
            req.session.account.amount = account.amount

            account.save()

            // Tạo một giao dịch mới
            const newTransaction = new Transaction({
                type: 3,
                amount: totalPayment,
                fee: 0,
                typeCardPhone: type,
                numberCardPhone: number,
                nameCardPhone: name,
                cardPhoneList: cardPhoneList,
                status: 0,
                senderPhone: phone
            })

            newTransaction.save()

            return res.json(formatResponse(0, `Mua thẻ thành công, số dư tài khoản hiện tại là: ${formatter.format(req.session.account.amount)}đ`
                            , { name, type, cardPhoneList }))
        } else {
            return res.json(formatResponse(1, 'Số dư tài khoản không đủ để thực hiện giao dịch'))
        }


    }

    // [GET] /deposit
    getDeposit(req, res, next) {
        res.render('user/deposit.hbs', { layout: 'userLayout' })
    }

    // [GET] /transactions/:id
    getTransactionById(req, res, next) {
        res.render('user/detailtransaction.hbs', { layout: 'userLayout' })
    }

    // [GET] /transactions
    getTransactions(req, res, next) {
        res.render('user/transactionhistory.hbs', { layout: 'userLayout' })
    }

    // [GET] /transfer
    getTransfer(req, res, next) {
        res.render('user/transfer.hbs', { layout: 'userLayout' })
    }

    // [POST] /transfer
    async postTransfer(req, res, next) {
        const { receiverPhone, note } = req.body
        const whoPayFee = parseInt(req.body.whoPayFee)
        const amount = parseInt(req.body.amount)
        const fee = parseInt(req.body.fee)
        let totalTranferAmount = amount // Chứa tổng số tiền sẽ bị trừ trong tài khoản người gửi

        if (whoPayFee === 0) {
            totalTranferAmount += fee
        }

        if (receiverPhone === req.session.account.phone) {
            res.json(formatResponse(1, 'Bạn không thể tự chuyển tiền cho chính mình'))
        }

        const receiverAccount = await Account.findOne({ phone: receiverPhone })

        // Kiểm tra tài khoản của người nhận có tồn tại không
        if (receiverAccount) {

            // Tình trạng tài khoản khác kích hoạt hoặc đang bị khóa vĩnh viễn thì không thể chuyển tiền
            if (receiverAccount.status !== 1 || receiverAccount.isBlock) {
                return res.json(formatResponse(1, 'Tài khoản người nhận hiện không thể nhận tiền'))
            }

            // Kiểm tra người gửi có đủ tiền không
            if (totalTranferAmount > req.session.account.amount) {
                return res.json(formatResponse(1, 'Số dư tài khoản không đủ để thực hiện giao dịch'))
            }

            const receiverUser = await User.findOne({ phone: receiverPhone }) // Lấy thông tin người nhận

            // Tạo một giao dịch mới
            const newTransaction = new Transaction({
                type: 2,
                amount: amount,
                note: note,
                fee: fee,
                status: 3,
                senderPhone: req.session.account.phone,
                receiverPhone: receiverPhone,
                whoPayFee: whoPayFee
            })
            const newTransactionId = newTransaction._id
            newTransaction.save()
                .catch(() => {
                    return res.json(formatResponse(2, 'Lỗi hệ thống, vui lòng thực hiện lại giao dịch'))
                })

            // Tạo một xác thực OTP mới
            const otpCode = createRandomString(6)

            const salt = bcrypt.genSaltSync(10)
            const hashOtpCode = bcrypt.hashSync(otpCode, salt)

            const newOtp = new OTP({
                id: newTransactionId,
                otp: hashOtpCode,
                createdAt: Date.now(),
                expiredAt: Date.now() + 60000,
            })
            newOtp.save()
                .catch(() => {
                    return res.json(formatResponse(2, 'Lỗi hệ thống, vui lòng thực hiện lại giao dịch'))
                })

            // Gửi mã OTP đến mail của người chuyển tiền
            const mailOptions = {
                from: 'hoangvunguyen01@gmail.com',
                to: req.session.account.email,
                subject: 'Xác thực chuyển tiền ví điện tử AVAT',
                text: `Vui lòng nhập mã OTP <${otpCode}> để xác thực chuyển tiền, mã OTP có hiệu lực trong 1 phút.`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.json(formatResponse(2, 'Lỗi hệ thống, vui lòng thực hiện lại giao dịch'))
                }

                return res.json(formatResponse(0, 'Vui lòng xác thực bằng mã OTP được gửi trong gmail, mã có hiệu lực trong 1 phút', { transactionId: newTransactionId, receiverName: receiverUser.name }))
            })
        } else {
            return res.json(formatResponse(1, 'Số điện thoại người nhận không tồn tại, vui lòng nhập lại'))
        }
    }

    // [POST] /transfer-confirm
    async confirmTranfer(req, res, next) {
        const { transactionId, otpCode } = req.body

        const otp = await OTP.findOne({ id: transactionId })

        if (otp) {
            if (otp.expiredAt < Date.now()) {
                await OTP.deleteOne({ id: transactionId })

                return res.json(formatResponse(2, 'Mã OTP đã hết hạn, vui lòng thực hiện lại giao dịch'))
            }

            const compareOTPCode = bcrypt.compareSync(otpCode, otp.otp)
            if (compareOTPCode) {
                await OTP.deleteOne({ id: transactionId })

                const transaction = await Transaction.findOne({ _id: transactionId })
                const amount = transaction.amount
                const fee = transaction.fee
                const whoPayFee = transaction.whoPayFee
                const senderPhone = transaction.senderPhone
                const receiverPhone = transaction.receiverPhone
                const note = transaction.note

                // Kiểm tra tiền chuyển có vượt 5tr không, có thì phải chờ admin duyệt
                if (amount <= 5000000) {
                    // Trừ số tiền chuyển đi trông tài khoản người chuyển
                    req.session.account.amount = req.session.account.amount - amount

                    const senderAccount = await Account.findOne({ phone: senderPhone })
                    senderAccount.amount = senderAccount.amount - amount

                    // Kiểm tra có phải người gửi trả phí không để trừ thêm
                    if (whoPayFee === 0) {
                        req.session.account.amount = req.session.account.amount - fee
                        senderAccount.amount = senderAccount.amount - fee
                    }
                    senderAccount.save()

                    // Cộng số tiền được chuyển vào tài khoản người nhận
                    const receiverAccount = await Account.findOne({ phone: receiverPhone })
                    receiverAccount.amount = receiverAccount.amount + amount

                    // Kiểm tra xem có phải người 
                    if (whoPayFee === 1) {
                        receiverAccount.amount = receiverAccount.amount - fee
                    }

                    const receiverEmail = receiverAccount.email // Lấy email để chút gửi thông tin đến email người nhận tiền
                    const receiverCurrentAmount = receiverAccount.amount // Lấy số dư tài khoản hiện tại của tài khoản người nhận

                    receiverAccount.save()

                    // Lấy thông tin người gửi tiền
                    const senderUser = await User.findOne({ phone: senderPhone })

                    // Bạn vừa được chuyển: ${formatter.format(amount)}đ vào tài khoản, số dư hiện tại là: ${formatter.format(receiverCurrentAmount)}đ
                    // Gửi thông tin đến email người nhận
                    const mailOptions = {
                        from: 'hoangvunguyen01@gmail.com',
                        to: receiverEmail,
                        subject: 'Chuyển tiền ví điện tử AVAT',
                        html: `
                            <p><b>Người gửi: </b>${senderUser.name}</p>
                            <p><b>Sđt người gửi: </b>${senderUser.phone}</p>
                            <p><b>Email người gửi: </b>${senderUser.email}</p>
                            <p><b>Số tiền gửi: </b>${formatter.format(amount)}đ</p>
                            <p><b>Phí trừ đi: </b>${whoPayFee === 1 ? formatter.format(fee) : 0}đ</p>
                            <p><b>Ghi chú: </b>${note}</p>
                            <p><b>Số dư hiện tại: </b>${formatter.format(receiverCurrentAmount)}đ</p>
                        `
                    }
                    transporter.sendMail(mailOptions)

                    // Cập nhật lại tình trạng của giao dịch
                    transaction.status = 0
                    transaction.save()

                    return res.json(formatResponse(0, `Chuyển tiền thành công, số dư tài khoản hiện tại là: ${formatter.format(req.session.account.amount)}đ`))

                } else {
                    transaction.status = 2
                    transaction.save()
                    return res.json(formatResponse(0, 'Giao dịch đã được ghi nhận, đang chờ được duyệt'))
                }


            } else {
                return res.json(formatResponse(1, 'Mã OTP không hợp lệ'))
            }

        } else {
            return res.json(formatResponse(1, 'Mã OTP không hợp lệ'))
        }
    }

    // [GET] /withdraw
    getWithdraw(req, res, next) {
        res.render('user/withdraw.hbs', { layout: 'userLayout' })
    }

    // [POST] /withdraw
    async postWithdraw(req, res, next) {
        const { cardId, cardCVV, expiredDate, note } = req.body
        const amount = parseInt(req.body.amount)
        const fee = parseInt(req.body.fee)
        const totalAmount = amount + fee 

        const today = moment().startOf('day')

        const todayTransactions = await Transaction.find({ createdAt: {
            $gte: today.toDate(),
            $lte: moment(today).endOf('day').toDate()
        }, senderPhone: req.session.account.phone, type: 1 })

        // Kiểm tra xem đã thực hiện hết số giao dịch rút tiền trong ngày chưa
        if (todayTransactions.length < 2) {
            // Kiểm tra tài khoản có đủ tiền thực hiện giao dịch không
            if (totalAmount <= req.session.account.amount) {
                // Kiểm tra thông tin thẻ có hợp lệ không
                const creditCard = await CreditCard.findOne({ idCard: '111111' })

                const date1 = new Date(creditCard.expireDate)
                const date2 = new Date(expiredDate)

                if (creditCard.idCard === cardId && creditCard.cvv === cardCVV && date1.getTime() === date2.getTime()) {
                    let message // Lưu tin nhắn trả về giao diện người dùng
    
                    // Tạo một giao dịch mới
                    const newTransaction = new Transaction({
                        type: 1,
                        idCard: cardId,
                        amount: amount,
                        note: note,
                        fee: fee,
                        senderPhone: req.session.account.phone
                    })
    
                    // Kiểm tra số tiền rút có trên 5tr không, nếu có thì phải chờ được duyệt
                    if (amount > 5000000) {
                        newTransaction.status = 2
    
                        message = 'Giao dịch đã được ghi nhận, đang chờ được duyệt'
                    } else {
                        newTransaction.status = 0
    
                        // Cập nhật lại số dư trong tài khoản người dùng
                        const account = await Account.findById(req.session.account._id)
    
                        req.session.account.amount = req.session.account.amount - totalAmount
                        account.amount = req.session.account.amount
    
                        account.save()
    
                        message = `Rút tiền thành công, số dư tài khoản hiện tại là: ${formatter.format(req.session.account.amount)}đ`
                    }
    
                    newTransaction.save()
    
                    return res.json(formatResponse(0, message))
                } else {
                    return res.json(formatResponse(1, 'Thông tin thẻ không hợp lệ'))
                }
            } else {
                return res.json(formatResponse(1, 'Số dư tài khoản không đủ để thực hiện giao dịch'))
            }
        } else {
            return res.json(formatResponse(2, 'Bạn chỉ được thực hiện tối đa 2 giao dịch rút tiền trong ngày, vui lòng thử lại vào ngày mai'))
        }
    }

    // [GET] /change-password
    getChangePassword(req, res, next) {
        res.render('user/password.hbs', { layout: 'userLayout' })
    }

    // [GET] /logout
    logout(req, res, next) {
        req.session.destroy(err => {
            if (err)
                return res.redirect('/')

            res.clearCookie('AVAT')
            res.redirect('/login')
        })
    }

    // [PUT] /profile-update
    async profileUpdate(req, res, next) {
        const { email } = req.session.account

        const user = await User.findOne({ email: email })
        const account = await Account.findOne({ email: email })

        const oldImgFront = user.imgFront
        const oldImgBack = user.imgBack

        user.imgFront = req.files['idphoto1'][0].filename
        user.imgBack = req.files['idphoto2'][0].filename

        account.status = 0

        user.save()
            .then(() => {
                account.save()
                    .then(() => {
                        const folderPath = path.join(__dirname, './../../public/images/users/')
                        req.session.account.status = 0

                        fs.unlinkSync(folderPath + oldImgFront)
                        fs.unlinkSync(folderPath + oldImgBack)

                        return res.json(formatResponse(0, 'Cập nhật ảnh thành công, đang chờ được xử lý'))
                    })
                    .catch(() => {
                        return res.json(formatResponse(1, 'Cập nhật ảnh thất bại, vui lòng thử lại'))
                    })
            })
            .catch(() => {
                return res.json(formatResponse(1, 'Cập nhật ảnh thất bại, vui lòng thử lại'))
            })

    }

    // [GET] /
    async index(req, res, next) {
        const { email, status, username, amount } = req.session.account
        const accountId = req.session.account._id
        const data = await User.findOne({ email: email })
        const user = mongooseToObject(data)
        let flash

        user.status = status
        user.accountId = accountId
        user.username = username
        user.amount = amount

        if (status === 0) {
            flash = {
                type: 'warning',
                intro: 'Thông báo!',
                message: `Tài khoản đang chờ kích hoạt.`
            }
        }

        if (status === 2) {
            flash = {
                type: 'danger',
                intro: 'Thông báo!',
                message: `Tài khoản cần cập nhật lại hình ảnh CMND/CCCD.`
            }
        }

        res.render('user/profile.hbs', { layout: 'userLayout', user, flash })
    }
}

module.exports = new UserController();
