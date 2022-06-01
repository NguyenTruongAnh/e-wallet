const Account = require('../models/Account')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose')
const { formatResponse } = require('../../util/response')
const transporter = require('../../config/mail/transporter')

// Format tiền về tiền Việt
const formatter = new Intl.NumberFormat('vi-VN')

class AdminController {
    // [PUT] /admin/accounts/:id
    updateStatusAccount(req, res, next) {
        Account.findByIdAndUpdate({_id: req.params.id}, req.body, {new: true})
            .then(() => res.json(formatResponse(0,`thành công`)))
            .catch(() => res.json(formatResponse(1,`thất bại`)))
    }

    // [PUT] /admin/transactions/:id
    async updateStatusTransaction(req, res, next) {
        const transaction = await Transaction.findById({ _id: req.params.id})

        if(transaction) {
            // Trường hợp từ chối
            if(req.body.status === 1) {
                transaction.status = 1
                transaction.save()
                    .then(() => res.json(formatResponse(0,`Từ chối`)))
                    .catch(() => res.json(formatResponse(1,`thất bại`)))
            } else {
                // Trường hợp đồng ý
                const accountSender = await Account.findOne({ phone: transaction.senderPhone })
                if(accountSender.amount < transaction.amount) {
                    return res.json(formatResponse(1,'thất bại. Số dư tài khoản không đủ.'))
                }
                // Xử lý từng loại giao dịch
                if(transaction.type === 1) {
                    // Kiểm tra số dư tài khoản
                    if(accountSender.amount < (transaction.amount + transaction.fee)) {
                        return res.json(formatResponse(1,'thất bại. Số dư tài khoản không đủ.'))
                    }
                    accountSender.amount -= (transaction.amount + transaction.fee)
                    console.log(accountSender.amount)
                } else {
                    const accountReceiver = await Account.findOne({ phone: transaction.receiverPhone})
                    if(transaction.whoPayFee === 0) {
                        // Kiểm tra số dư tài khoản
                        if(accountSender.amount < (transaction.amount + transaction.fee)) {
                            return res.json(formatResponse(1,'thất bại. Số dư tài khoản không đủ.'))
                        }
    
                        accountSender.amount -= (transaction.amount + transaction.fee)
                        accountReceiver.amount += transaction.amount
                    } else {
                        accountSender.amount -= transaction.amount
                        accountReceiver.amount += (transaction.amount - transaction.fee)
                    }
                    accountReceiver.save()
                        .catch(() => res.json(formatResponse(1, 'thất bại')))
                    
                    const userSender = await User.findOne({ phone: transaction.senderPhone })
                    // Gửi thông tin đến email người nhận
                    const mailOptions = {
                        from: 'hoangvunguyen01@gmail.com',
                        to: accountReceiver.email,
                        subject: 'Chuyển tiền ví điện tử AVAT',
                        html: `
                            <p><b>Người gửi: </b>${userSender.name}</p>
                            <p><b>Sđt người gửi: </b>${userSender.phone}</p>
                            <p><b>Email người gửi: </b>${userSender.email}</p>
                            <p><b>Số tiền gửi: </b>${formatter.format(transaction.amount)}đ</p>
                            <p><b>Phí trừ đi: </b>${transaction.whoPayFee === 1 ? formatter.format(transaction.fee) : 0}đ</p>
                            <p><b>Ghi chú: </b>${transaction.note}</p>
                            <p><b>Số dư hiện tại: </b>${formatter.format(accountReceiver.amount)}đ</p>
                        `
                    }
                    transporter.sendMail(mailOptions)
                }
                
                accountSender.save()
                        .catch(() => res.json(formatResponse(1, 'thất bại')))

                transaction.status = 0
                transaction.save()
                    .then(() => res.json(formatResponse(0,'Đồng ý', accountSender.amount)))
                    .catch(() => res.json(formatResponse(1,'thất bại')))
            }
        } else {
            return res.json(formatResponse(0,'Giao dịch không tồn tại'))
        }
    }

    // [GET] /admin/accounts
    async getAccounts(req, res, next) {
        const start = req.query.start ? parseInt(req.query.start) : 0
        const status = req.query.status
        const json = req.query.json
        let accounts
        try {
            switch (status) {
                case 'active':
                    accounts = await Account.find({ status: 1 }).sort({ createdAt: -1}).skip(start).limit(10)
                    break
                case 'disable':
                    accounts = await Account.find({ status: 3 }).sort({ createdAt: -1}).skip(start).limit(10)
                    break
                case 'block':
                    accounts = await Account.find({ isBlock: true }).sort({ blockDate: -1}).skip(start).limit(10)
                    break
                default:
                    accounts = await Account.find({ status: 0 })
                                .sort({ createdAt: -1, updatedAt: -1 }).skip(start).limit(10)
                    break
            }
        } catch(err) {
            console.log(err)
            accounts = [] 
        }
        
        if(json) {
            return res.json(accounts)
        }
        accounts = mutipleMongooseToObject(accounts)
        res.render('admin/account/index.hbs', { layout: 'adminLayout', title: 'AVAT - Admin', active: 'active--account', accounts })
    }

    // [GET] /admin/accounts/:id
    async getAccountById(req, res, next) {
        let account = await Account.findById({_id: req.params.id})
        let user = await User.findOne({ phone: account.phone })
        let transactions = await Transaction.find({ $or: [ { senderPhone: account.phone }, 
            { receiverPhone: account.phone } ] }).sort({createdAt: -1}).limit(10)
        user = mongooseToObject(user)
        user.accountId = account._id
        user.username = account.username
        user.status = account.status
        user.isBlock = account.isBlock
        transactions = mutipleMongooseToObject(transactions)
        res.render('admin/account/detail.hbs', { layout: 'adminLayout', title: 'AVAT - Chi tiết tài khoản', active: 'active--account', user, transactions })
    }

    // [GET] /admin/accounts/transactions/:phone
    async getTransactionsForAccount(req, res, next) {
        const start = req.query.start ? parseInt(req.query.start) : 0
        const transactions = await Transaction.find({ $or: [ { senderPhone: req.params.phone }, 
            { receiverPhone: req.params.phone } ] }).sort({createdAt: -1}).skip(start).limit(10)
        res.json(transactions)
    }

    // [GET] /admin/transactions
    async getTransactions(req, res, next) {
        const start = req.query.start ? parseInt(req.query.start) : 0
        const json = req.query.json
        let transactions = await Transaction.find({
                type: { $in : [1, 2] },
                amount: { $gt: 5000000 },
                status: 2 
            }).sort({ createdAt: -1 }).skip(start).limit(10)
        if(json) 
            return res.json(transactions)
        transactions = mutipleMongooseToObject(transactions)
        res.render('admin/transaction/index.hbs', { layout: 'adminLayout', title: 'AVAT - Danh sách giao dịch chờ duyệt', active: 'active--transaction', transactions })
    }

    // [GET] /admin/transactions/:id
    async getTransactionById(req, res, next) {
        let transaction = await Transaction.findById({ _id: req.params.id })
        let user
        if(transaction) {
            transaction = mongooseToObject(transaction)
            let account = await Account.findOne({ phone: transaction.senderPhone})
            user = await User.findOne({ phone: transaction.senderPhone})
            user = mongooseToObject(user)
            user._id = account._id
            user.amount = account.amount
        }
        res.render('admin/transaction/detail.hbs', { layout: 'adminLayout', title: 'AVAT - Chi tiết giao dịch chờ duyệt', active: 'active--transaction', transaction, user })
    }
}

module.exports = new AdminController();