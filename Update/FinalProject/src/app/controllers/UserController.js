const Account = require('../models/Account')
const { mutipleMongooseToObject } = require('../../util/mongoose')

class UserController {
    
    // [GET] /card
    getCard(req, res, next) {
        res.render('member/card.hbs', { layout: 'memberlayout' })
    }

    // [GET] /deposit
    getDeposit(req, res, next) {
        res.render('member/deposit.hbs', { layout: 'memberlayout' })
    }

    // [GET] /transactions/:id
    getTransactionById(req, res, next) {
        res.render('member/detailtransaction.hbs', { layout: 'memberlayout' })
    }

    // [GET] /transactions
    getTransactions(req, res, next) {
        res.render('member/transactionhistory.hbs', { layout: 'memberlayout' })
    }

    // [GET] /transfer
    getTransfer(req, res, next) {
        res.render('member/transfer.hbs', { layout: 'memberlayout' })
    }

    // [GET] /withdraw
    getWithdraw(req, res, next) {
        res.render('member/withdraw.hbs', { layout: 'memberlayout' })
    }

    // [GET] /change-password
    getChangePassword(req, res, next) {
        res.render('member/password.hbs', { layout: 'memberlayout' })
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
        res.render('member/profile.hbs', { layout: 'memberlayout' })
    }
}

module.exports = new UserController();