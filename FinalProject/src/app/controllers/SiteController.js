const Account = require('../models/Account')
const { mutipleMongooseToObject } = require('../../util/mongoose')
const bcrypt = require('bcrypt')

class SiteController {
    // [GET] /login
    login(req, res) {
        const flash = req.flash('flash') || ''
        res.render('login.hbs', { layout: 'emptyLayout', flash: flash[0] })
    }

    // [POST] /login
    checkLogin(req, res) {
        const { username, password } = req.body

        Account.findOne({ username: username })
            .then((account) => {
                console.log(account)

                // Kiểm tra có tồn tại tài khoản không
                if (account) {
                    // So sánh mật khẩu
                    bcrypt.compare(password, account.password)
                        .then((result) => {
                            if (result) {
                                // Tới đây có thể tiến hành lưu thông tin tài khoản vào session được rồi



                                // Kiểm tra tài khoản đăng nhập đó đã đổi mật khẩu lần đầu chưa
                                if (account.isChangeDefaultPassword) {
                                    req.flash('flash', {
                                        type: 'success',
                                        intro: 'Thành công!',
                                        message: 'Đăng nhập thành công'
                                    })
                                    return res.redirect('back')
                                } else {
                                    req.flash('flash', {
                                        type: 'success',
                                        intro: 'Thông báo!',
                                        message: 'Vui lòng đổi sang mật khẩu mới'
                                    })

                                    return res.redirect('/reset-password')
                                }
                            } else {
                                req.flash('flash', {
                                    type: 'danger',
                                    intro: 'Thất bại!',
                                    message: 'Tên tài khoản hoặc mật khẩu không chính xác'
                                })
                                return res.redirect('back')
                            }
                        })
                        .catch((err) => {
                            req.flash('flash', {
                                type: 'danger',
                                intro: 'Thất bại!',
                                message: 'Lỗi đăng nhập, vui lòng thử lại'
                            })
                            return res.redirect('back')
                        })
                } else {
                    req.flash('flash', {
                        type: 'danger',
                        intro: 'Thất bại!',
                        message: 'Tên tài khoản hoặc mật khẩu không chính xác'
                    })
                    return res.redirect('back')
                }
            })
            .catch((err) => {
                console.log(err)
                return res.json({ code: 1, message: 'Lỗi đăng nhập, vui lòng thử lại' })
            })
    }

    // [GET] /register
    register(req, res) {
        res.render('register.hbs', { layout: 'emptyLayout' })
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
