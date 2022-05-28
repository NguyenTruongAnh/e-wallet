const Account = require('../models/Account')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const { mutipleMongooseToObject, mongooseToObject } = require('../../util/mongoose')
const { formatResponse } = require('../../util/response')

class AdminController {
    // [PUT] /admin/accounts/:id
    updateStatus(req, res, next) {
        Account.findByIdAndUpdate({_id: req.params.id}, req.body, {new: true})
            .then(() => res.json(formatResponse(0,`thành công`)))
            .catch(() => res.json(formatResponse(1,`thất bại`)))
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
                    accounts = await Account.find({ status: 3 }).sort({ blockDate: -1}).skip(start).limit(10)
                    break
                case 'block':
                    accounts = await Account.find({ isBlock: true }).sort({ createdAt: -1}).skip(start).limit(10)
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
        res.render('admin/account/index.hbs', { layout: 'adminLayout', active: 'active--account', accounts })
    }

    // [GET] /admin/accounts/:id
    async getAccountById(req, res, next) {
        let user
        let account
        try {
            account = await Account.findById({_id: req.params.id})
            user = await User.findOne({ phone: account.phone })
            user = mongooseToObject(user)
            user.accountId = account._id
            user.username = account.username
            user.status = account.status
            user.isBlock = account.isBlock
        } catch(err) {
            console.log(err)
        }
        res.render('admin/account/detail.hbs', { layout: 'adminLayout', active: 'active--account', user })
    }

    // [GET] /admin/transactions
    async getTransactions(req, res, next) {
        const json = req.query.json
        let transactions = await Transaction.find({
                type: ['transfer', 'widraw'], amount: { $gt: 20000 } 
            }).sort({ createdAt: -1 })
        if(json) 
            return res.json(transactions)
        transactions = mutipleMongooseToObject(transactions)
        res.render('admin/transaction/index.hbs', { layout: 'adminLayout', active: 'active--transaction', transactions })
    }

    getTransactionById(req, res, next) {
        res.render('admin/transaction/detail.hbs', { layout: 'adminLayout', active: 'active--transaction' })
    }
}

module.exports = new AdminController();