const Account = require('../models/Account')
const { mutipleMongooseToObject } = require('../../util/mongoose')

class AdminController {
    // [GET] /admin/accounts
    getAccounts(req, res, next) {
        res.render('admin/account/index.hbs', { layout: 'adminLayout', active: 'active--account' })
    }

    // [GET] /admin/accounts/:id
    getAccountById(req, res, next) {
        res.render('admin/account/detail.hbs', { layout: 'adminLayout', active: 'active--account' })
    }

    // [GET] /admin/transactions
    getTransactions(req, res, next) {
        res.render('admin/transaction/index.hbs', { layout: 'adminLayout', active: 'active--transaction' })
    }

    getTransactionById(req, res, next) {
        res.render('admin/transaction/detail.hbs', { layout: 'adminLayout', active: 'active--transaction' })
    }
}

module.exports = new AdminController();