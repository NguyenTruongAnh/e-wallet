const Account = require('../models/Account')
const {check, validationResult} = require('express-validator');
const User = require('../models/User')
const { mutipleMongooseToObject } = require('../../util/mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const mailingOptions = require('../../config/mail/option')
const { createPassword, createUsername,createOTP } = require('../../util/random')
class SiteController {
    // [GET] /login
    login(req, res) {
        const flash = req.flash('flash') || ''
        res.render('login.hbs', { layout: 'emptyLayout', flash: flash[0] })
    }

    // [POST] /login
    async checkLogin(req, res) {
        const { username, password } = req.body
        
        const account = await Account.findOne({username: username})

        // Kiểm tra có tồn tại tài khoản không
        if (account) {
            // Kiểm tra có bị khóa tạm thời
            if(account.isBlock) {
                req.flash('flash', {
                    type: 'danger',
                    intro: 'Thông báo!',
                    message: 'Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ.'
                })
                return res.redirect('back')
            }
            // Kiểm tra có bị khóa tạm thời trong 1p
            if(account.blockTime) {
                const blockTime = new Date(account.blockTime)
                const now = new Date()
                if(now < blockTime) {
                    req.flash('flash', {
                        type: 'danger',
                        intro: 'Thông báo!',
                        message: 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút.'
                    })
                    return res.redirect('back')
                }
            }
            // So sánh mật khẩu
            const comparePassword = bcrypt.compareSync(password, account.password)
            if(comparePassword) {
                // Kiểm tra tài khoản đăng nhập đó đã đổi mật khẩu lần đầu chưa
                req.session.account = account
                if(account.isAdmin) {
                    req.flash('flash', {
                        type: 'success',
                        intro: 'Thành công!',
                        message: 'Đăng nhập thành công.'
                    })
                    return res.redirect('/admin/accounts')
                }
                account.invalidLoginTime = 0
                account.wrongPasswordTime = 0
                account.blockTime = ""
                account.save()
                    .catch(() => {
                        req.flash('flash', {
                            type: 'danger',
                            intro: 'Thất bại!',
                            message: 'Lỗi đăng nhập, vui lòng thử lại.'
                        })
                        return req.redirect('back')
                    })
                if (account.isChangeDefaultPassword) {
                    // req.flash('flash', {
                    //     type: 'success',
                    //     intro: 'Thành công!',
                    //     message: 'Đăng nhập thành công.'
                    // })
                    return res.redirect('/')
                } else {
                    req.flash('flash', {
                        type: 'success',
                        intro: 'Thông báo!',
                        message: 'Vui lòng đổi sang mật khẩu mới!'
                    })
                    req.session.phoneToChangPW = account.phone
                    return res.redirect('/reset-password')
                }
               
            } else {
                if(!account.isAdmin) {
                    if(account.invalidLoginTime && account.wrongPasswordTime === 2) {
                        // Khóa user
                        account.isBlock = true
                        account.save()
    
                    } else if(account.wrongPasswordTime === 2) {
                        // +1 đăng nhập bất thường => đợi 1p
                        account.wrongPasswordTime = 0
                        account.invalidLoginTime += 1
                        const wait = new Date()
                        wait.setMinutes(wait.getMinutes() + 1)
                        account.blockTime = wait
                        account.save()
                    } else {
                        account.wrongPasswordTime += 1
                        account.save()
                    }
                }
                req.flash('flash', {
                    type: 'danger',
                    intro: 'Thất bại!',
                    message: 'Tên tài khoản hoặc mật khẩu không chính xác'
                })
                return res.redirect('back')
            }
        } else {
            req.flash('flash', {
                type: 'danger',
                intro: 'Thất bại!',
                message: 'Tên tài khoản hoặc mật khẩu không chính xác!'
            })
            return res.redirect('back')
        }
    }

    // [GET] /register
    register(req, res) {
        const flash = req.flash('flash') || ''
        res.render('register.hbs', { layout: 'emptyLayout', flash: flash[0] })
    }

    // [POST] /register
    async Register(req, res) {
        const { phone, email } = req.body
        
        let oldUser = await User.findOne({ phone });
        if(oldUser) {
            req.flash('flash', {
                type: 'danger',
                intro: 'Thông báo!',
                message: `Số điện thoại ${phone} đã được sử dụng.`
            })
            return res.redirect("back")
        }
    
        oldUser = await User.findOne({ email });
        if(oldUser) {
            req.flash('flash', {
                type: 'danger',
                intro: 'Thông báo!',
                message: `Email ${email} đã được sử dụng.`
            })
            return res.redirect("back")
        }


        const salt = bcrypt.genSaltSync(10)
        const username = createUsername()
        const password = createPassword()
        const password_hash = bcrypt.hashSync(password, salt)
        req.body.imgFront = req.files['idphoto1'][0].filename
        req.body.imgBack = req.files['idphoto2'][0].filename
        const user = new User(req.body)
        user.save()
            .catch(() => res.redirect('back'))

        const account = new Account({ username, password: password_hash, phone })
        account.save()
            .catch(() => res.redirect('back'))

        
        const transporter = nodemailer.createTransport(mailingOptions);
        const mailOptions = {
            from: 'Ví điện tử AVAT',
            to: email,
            subject: 'Tài khoản ví điện tử AVAT',
            html: `<p>Chúc mừng bạn đã tạo tài khoản thành công. Tên tài khoản của bạn là <b>${username}</b> với mật khẩu <b>${password}</b></p>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if(error) {
                console.log(error)
                req.flash('flash', {
                    type: 'danger',
                    intro: 'Thông báo!',
                    message: `Something wrong.`
                })
                return res.redirect("back")
            }
            req.flash('flash', {
                type: 'success',
                intro: 'Thành công!',
                message: `Vui lòng check email để nhận được tài khoản.`
            })
            return res.redirect("/login")
        })
    }

    // [GET] /reset-password
    resetPassword(req, res) {
     
        const flash = req.flash('flash') || ''
        res.render('reset-password.hbs', { layout: 'emptyLayout', flash: flash[0], error : req.flash('error') })
    }
    postResetPassword(req,res){
        const {password, cfPassword} = req.body
        if(!password){
            req.flash('error','Vui lòng nhập mật khẩu mới.') 
            return res.redirect('/reset-password')
        }
        if(!cfPassword){
            req.flash('error','Vui lòng nhập mật khẩu xác nhận.') 
            return res.redirect('/reset-password')
        }
        if(!password.length >= 6){
            req.flash('error','Mật khẩu mới phải có độ dài trên 6 kí tự.') 
            return res.redirect('/reset-password')
        }
        if(!cfPassword.length >= 6){
            req.flash('error','Mật khẩu xác nhận phải có độ dài trên 6 kí tự.') 
            return res.redirect('/reset-password')
        }
        if(password !== cfPassword){
            req.flash('error','Mật khẩu xác nhận không khớp.') 
            return res.redirect('/reset-password')
        }
        const phone =  req.session.phoneToChangPW
        const password_hash = bcrypt.hashSync(password, 10)
        Account.updateOne({phone: phone},{$set :{password : password_hash, status : 1, isChangeDefaultPassword: true}},(err)=>{
            if(err)
            console.log(err)

                req.session.account.isChangeDefaultPassword = true
                req.session.phone = null
                return res.redirect('/')
            
            
        })
        
    }
    // [GET] /recovery
    recovery(req, res) {
        const email = req.flash('email')
        const phone = req.flash('phone')
        const flash = req.flash('flash') || ''
        const error = req.flash('error')
        res.render('recovery.hbs', { layout: 'emptyLayout', phone: phone, email: email, error: error,flash: flash[0]})
    }

    // [POST] /recovery
    Recovery(req, res) {
        let result = validationResult(req)
            const {phone, email} = req.body
            if(result.errors.length === 0){
                User.findOne({email : email},(err,user)=>{
                    if(err)
                    console.log(err)
                    if(!user){
                        req.flash('phone','')
                        req.flash('email','')
                        req.flash('error','Tài khoản không tồn tài')
                        return res.redirect('/recovery') 
                    }else{
                        if(user.phone !== phone){
                            req.flash('phone','')
                            req.flash('email',email)
                            req.flash('error','Số điện thoại không chính xác')
                            return res.redirect('/recovery') 
                        }else{
                            Account.findOne({phone: phone},(err,account)=>{
                                if(err)
                                console.log(err)
                                if(account.status == 3){
                                    req.flash('error', 'Tài khoản này đã bị vô hiệu hóa, hiện không thể sử dụng được chức năng này.')
                                    return res.redirect('/recovery') 
                                }
                                //pass
                              
                                req.session.email = email
                                req.session.phone = phone
                                req.session.sent = true
                                req.flash('flash', {
                                    type: 'success',
                                    intro: 'Thành công!',
                                    message: `Vui lòng check email để nhận được mã OTP.` 
                                })
                                return res.redirect('/recovery2')
                            })
                           
                        }
                    }
                })
            }else{
                result = result.mapped()
                let message = ''
                for(fields in result){
                    message = result[fields].msg
                    break;
                }
                req.flash('phone',phone)
                req.flash('email',email)
                req.flash('error',message)
                return res.redirect('/recovery') 
            }
    }


    // [GET] /recovery2
    recovery2(req, res) {
        if(!req.session.sent){
            return res.redirect('/recovery')
        }
        const flash = req.flash('flash') || ''
        const email = req.session.email
        const otp = createOTP()
        req.session.otp = otp
        const transporter = nodemailer.createTransport(mailingOptions);
        const mailOptions = {
            from: 'Ví điện tử AVAT',
            to: email,
            subject: 'Mã OTP khôi phục mật khẩu ví điện tử AVAT',
            html: `<p>Mã OTP khôi phục mật khẩu của bạn là <b>${otp}</b>. Mã sẽ hết hạn trong vòng <b>1 phút</b>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if(error) {
                console.log(error)
                req.flash('flash', {
                    type: 'danger',
                    intro: 'Thông báo!',
                    message: `Something wrong.`
                })
            }
            req.flash('flash', {
                type: 'success',
                intro: 'Thành công!',
                message: `Vui lòng check email để nhận được mã OTP.`
            })
            
        })
        res.render('recovery2.hbs', { layout: 'emptyLayout', flash: flash[0] })
    }

    async Recovery2(req,res){
        const {otp, remain, password, cfPassword} = req.body
        const email =  req.session.email 
        const phone =  req.session.phone 

        req.session.sent = false
        const flash = req.flash('flash') || ''

        if(otp !== req.session.otp){
            req.flash('error', 'Mã OTP không chính xác.')
            return res.render('recovery2.hbs', { layout: 'emptyLayout', error: req.flash('error'), remain: remain })
        }
        if(!password){
            req.flash('error', 'Vui lòng nhập mật khẩu mới.')
            return res.render('recovery2.hbs', { layout: 'emptyLayout', error: req.flash('error'), remain: remain })
        }
        if(!cfPassword){
            req.flash('error', 'Vui lòng nhập mật khẩu xác nhận.')
            return res.render('recovery2.hbs', { layout: 'emptyLayout', error: req.flash('error'), remain: remain })
        }
        if(password.length  != cfPassword.length){
            req.flash('error', 'Mật khẩu xác nhận không chính xác.')
            return res.render('recovery2.hbs', { layout: 'emptyLayout', error: req.flash('error'), remain: remain })
        }
        if(password.length < 6 || cfPassword.length < 6){
            req.flash('error', 'Mật khẩu mới phải dài hơn 6 kí tự.')
            return res.render('recovery2.hbs', { layout: 'emptyLayout', error: req.flash('error'), remain: remain })
        }
        if(password != cfPassword){
            req.flash('error', 'Mật khẩu xác nhận không chính xác.')
            return res.render('recovery2.hbs', { layout: 'emptyLayout', error: req.flash('error'), remain: remain })
        }
       
        const account = await Account.findOne({phone : phone})

        if(account.status == 0 || account.status == 1){
  
            const password_hash = bcrypt.hashSync(password, 10)
            Account.updateOne({phone: phone},{$set :{password : password_hash, status : 1,isChangeDefaultPassword: true}},(err)=>{
                if(err)
                console.log(err)

    
                    req.session.otp = null
                    req.session.email = null
                    req.session.phone = null
                    return res.redirect('/login')
                
                
            })

        }
        
      
    }

}

module.exports = new SiteController();
