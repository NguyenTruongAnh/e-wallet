const Account = require('../models/Account')
const User = require('../models/User')
const { mutipleMongooseToObject } = require('../../util/mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const { createPassword, createUsername } = require('../../util/random')
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

            // Kiểm tra có bị vô hiệu hóa
            if(account.status === 3) {
                req.flash('flash', {
                    type: 'danger',
                    intro: 'Thông báo!',
                    message: 'Tài khoản đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008.'
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
                    req.flash('flash', {
                        type: 'success',
                        intro: 'Thành công!',
                        message: 'Đăng nhập thành công.'
                    })
                    return res.redirect('/')
                } else {
                    req.flash('flash', {
                        type: 'success',
                        intro: 'Thông báo!',
                        message: 'Vui lòng đổi sang mật khẩu mới!'
                    })

                    return res.redirect('/reset-password')
                }
            } else {
                if(!account.isAdmin) {
                    if(account.invalidLoginTime && account.wrongPasswordTime === 2) {
                        // Khóa user
                        account.isBlock = true
                        account.blockDate = new Date()
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

        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     host: "mail.phongdaotao.com",
        //     port: 25,
        //     secure: false, 
        //     auth: {
        //         user: "sinhvien@phongdaotao.com",
        //         pass: "svtdtu",
        //     },
        //     tls: { rejectUnauthorized: false },
        // });
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "hoangvunguyen01@gmail.com",
            port: 25,
            secure: false, 
            auth: {
                user: "hoangvunguyen01@gmail.com",
                pass: "hoangvu01",
            },
            tls: { rejectUnauthorized: false },
        });

        const mailOptions = {
            from: 'hoangvunguyen01@gmail.com',
            to: email,
            subject: 'Tài khoản ví điện tử AVAT',
            text: `Chúc mừng bạn đã tạo tài khoản thành công. Tên tài khoản của bạn là ${username} với mật khẩu ${password}`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if(error) {
                console.log(error)
                req.flash('flash', {
                    type: 'danger',
                    intro: 'Thông báo!',
                    message: `Lỗi đăng ký, vui lòng thử lại.`
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
        res.render('reset-password.hbs', { layout: 'emptyLayout', flash: flash[0] })
    }

    // [GET] /recovery
    recovery(req, res) {
        res.render('recovery.hbs', { layout: 'emptyLayout' })
    }

    // [GET] /recovery2
    recovery2(req, res) {
        res.render('recovery2.hbs', { layout: 'emptyLayout' })
    }

}

module.exports = new SiteController();
