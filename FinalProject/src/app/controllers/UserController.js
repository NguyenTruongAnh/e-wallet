const Account = require('../models/Account')
const { mutipleMongooseToObject } = require('../../util/mongoose')
const User = require('../models/User')
const fs = require('fs')
const path = require('path')
const CreditCard = require('../models/CreditCard')
const flash = require('express-flash')
const Transaction = require('../models/Transaction')
class UserController {
    
    // [GET] /card
    getCard(req, res, next) {
        res.render('member/card.hbs', { layout: 'memberlayout' })
    }

    // [GET] /deposit
    getDeposit(req, res, next) {
        const error = req.flash('error')
        res.render('member/deposit.hbs', { layout: 'memberlayout', error : error })
    }

    postDeposit(req,res,next){
        return res.redirect('/deposit')
    }
    // [GET] /transactions/:id
    getTransactionById(req, res, next) {
        res.render('member/detailtransaction.hbs', { layout: 'memberlayout' })
    }

    success(req,res){
        res.render('member/success.hbs', { layout: 'memberlayout' })
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
        const error = req.flash('error')
        res.render('member/withdraw.hbs', { layout: 'memberlayout', error : error  })
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

        const flash = req.flash('flash') || ''
  
        // console.log(new Date().toISOString())
        // // Transaction.find({createdAt : })
        // let today = new Date('2022-05-25T08:19:32.937+00:00').toLocaleString()
        // console.log(today)

        req.session.account.isChangeDefaultPassword = true
        const currentAccount = req.session.account
        User.findOne({phone : currentAccount.phone},(err,user)=>{
            const name = user.name
            const dob = user.birthday
            const email = user.email
            const phone = user.phone
            const id = user._id
            const username = currentAccount.username
            let status = ''
            if(currentAccount.status == 0){
                status = 'Chưa xác minh'
            }else if(currentAccount.status == 1){
                status = 'Kích hoạt'
            }else if(currentAccount.status == 2){
                status = 'Yêu cầu bổ sung'
            }else{
                status = 'Vô hiệu hóa'
            }
         
            const amount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentAccount.amount)
            const imgFront = user.imgFront
            const imgBack = user.imgBack
            res.render('member/profile.hbs', { layout: 'memberlayout', account : currentAccount, name : name,email: email, dob: dob, phone: phone, id: id, username : username,status: status, amount : amount, imgFront : imgFront, imgBack : imgBack, flash: flash[0]  })
        })
        
    }
    async updateImg(req,res){
       
        let currentUser = await User.findOne({ phone: req.session.account.phone });
        console.log(currentUser)
        fs.unlinkSync(path.join(__dirname,'../../public/images/users/') + currentUser.imgFront)
        fs.unlinkSync(path.join(__dirname,'../../public/images/users/') + currentUser.imgBack)

        User.updateOne({phone: req.session.account.phone },{imgFront: req.files['idphoto1'][0].filename, imgBack:req.files['idphoto2'][0].filename},(err)=>{
            if(err)
            console.log(err)
            return res.redirect('/')
        })
    }
}

module.exports = new UserController();