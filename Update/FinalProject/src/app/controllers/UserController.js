const Account = require('../models/Account')
const { mutipleMongooseToObject } = require('../../util/mongoose')

class UserController {
    
    // [GET] /card
    getCard(req, res, next) {
        res.render('user/card.hbs', { layout: 'userLayout' })
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

    // [GET] /withdraw
    getWithdraw(req, res, next) {
        res.render('user/withdraw.hbs', { layout: 'userLayout' })
    }

    // [GET] /change-password
    getChangePassword(req, res, next) {
        res.render('user/password.hbs', { layout: 'userLayout' })
    }

    // [GET] /logout
    logout(req, res, next) {
        req.session.destroy(err => {
            if(err)
                return res.redirect('/')
            
            res.clearCookie('AVAT')
            res.redirect('/login')
        })
    }

    // [GET] /
    index(req, res, next) {
        res.render('user/profile.hbs', { layout: 'userLayout' })
    }
}

module.exports = new UserController();