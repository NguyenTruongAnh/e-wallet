const Account = require('../models/Account')
const User = require('../models/User')
const OTP = require('../models/OTP')
const { mutipleMongooseToObject } = require('../../util/mongoose')
const bcrypt = require('bcrypt')
const transporter = require('../../config/mail/transporter')
const { formatResponse } = require('../../util/response')
const { createRandomString, createRandomNumber } = require('../../lib/random')

class SiteController {
    // [GET] /login
    login(req, res) {
        const flash = req.flash('flash') || ''
        res.render('login.hbs', { layout: 'emptyLayout', flash: flash[0] })
    }

    // [POST] /login
    async checkLogin(req, res) {
        const { username, password } = req.body

        const account = await Account.findOne({ username: username })

        // Kiểm tra có tồn tại tài khoản không
        if (account) {
            // Kiểm tra có bị khóa tạm thời
            if (account.isBlock) {
                req.flash('flash', {
                    type: 'danger',
                    intro: 'Thông báo!',
                    message: 'Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ.'
                })
                return res.redirect('back')
            }

            // Kiểm tra có bị vô hiệu hóa
            if (account.status === 3) {
                req.flash('flash', {
                    type: 'danger',
                    intro: 'Thông báo!',
                    message: 'Tài khoản đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008.'
                })
                return res.redirect('back')
            }
            // Kiểm tra có bị khóa tạm thời trong 1p
            if (account.blockTime) {
                const blockTime = new Date(account.blockTime)
                const now = new Date()
                if (now < blockTime) {
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
            if (comparePassword) {
                // Kiểm tra tài khoản đăng nhập đó đã đổi mật khẩu lần đầu chưa
                req.session.account = account
                if (account.isAdmin) {
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
                if (!account.isAdmin) {
                    if (account.invalidLoginTime && account.wrongPasswordTime === 2) {
                        // Khóa user
                        account.isBlock = true
                        account.blockDate = new Date()
                        account.save()

                    } else if (account.wrongPasswordTime === 2) {
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
        if (oldUser) {
            req.flash('flash', {
                type: 'danger',
                intro: 'Thông báo!',
                message: `Số điện thoại ${phone} đã được sử dụng.`
            })
            return res.redirect("back")
        }

        oldUser = await User.findOne({ email });
        if (oldUser) {
            req.flash('flash', {
                type: 'danger',
                intro: 'Thông báo!',
                message: `Email ${email} đã được sử dụng.`
            })
            return res.redirect("back")
        }


        const salt = bcrypt.genSaltSync(10)
        const username = createRandomNumber(10)
        const password = createRandomString(6)
        const password_hash = bcrypt.hashSync(password, salt)
        req.body.imgFront = req.files['idphoto1'][0].filename
        req.body.imgBack = req.files['idphoto2'][0].filename
        const user = new User(req.body)
        user.save()
            .catch(() => res.redirect('back'))

        const account = new Account({ username, password: password_hash, phone, email })
        account.save()
            .catch(() => res.redirect('back'))

        const mailOptions = {
            from: 'hoangvunguyen01@gmail.com',
            to: email,
            subject: 'Tài khoản ví điện tử AVAT',
            text: `Chúc mừng bạn đã tạo tài khoản thành công. Tên tài khoản của bạn là ${username} với mật khẩu ${password}`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
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
        const flash = req.flash('flash') || ''
        res.render('recovery.hbs', { layout: 'emptyLayout', flash: flash[0] })
    }

    // [POST] /recovery
    async Recovery(req, res) {
        const { email, phone } = req.body

        const account = await Account.findOne({ email: email, phone: phone })

        if (account) {
            // Kiểm tra có bị khóa tạm thời
            if (account.isBlock) {
                req.flash('flash', {
                    type: 'danger',
                    intro: 'Thông báo!',
                    message: 'Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ.'
                })
                return res.redirect('back')
            }

            // Kiểm tra có bị vô hiệu hóa
            if (account.status === 3) {
                req.flash('flash', {
                    type: 'danger',
                    intro: 'Thông báo!',
                    message: 'Tài khoản đã bị vô hiệu hóa, vui lòng liên hệ tổng đài 18001008.'
                })
                return res.redirect('back')
            }

            // Kiểm tra có bị khóa tạm thời trong 1p
            if (account.blockTime) {
                const blockTime = new Date(account.blockTime)
                const now = new Date()
                if (now < blockTime) {
                    req.flash('flash', {
                        type: 'danger',
                        intro: 'Thông báo!',
                        message: 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút.'
                    })
                    return res.redirect('back')
                }
            }

            // Kiểm tra xem tài khoản này có yêu cầu đổi mật khẩu trước đó chưa, nếu có thì xóa đi
            const otp = await OTP.findOne({ id: email })
            if (otp) {
                await OTP.deleteOne({ id: email })
            }

            // Tạo mã otp ngẫu nhiên
            const otpCode = createRandomString(6)

            const salt = bcrypt.genSaltSync(10)
            const hashOtpCode = bcrypt.hashSync(otpCode, salt)

            const newOtp = new OTP({
                id: email,
                otp: hashOtpCode,
                createdAt: Date.now(),
                expiredAt: Date.now() + 60000,
            })

            newOtp.save()
                .then(() => {
                    const mailOptions = {
                        from: 'hoangvunguyen01@gmail.com',
                        to: email,
                        subject: 'Khôi phục mật khẩu tài khoản ví điện tử AVAT',
                        text: `Vui lòng nhập mã OTP <${otpCode}> để khôi phục mật khẩu, mã OTP có hiệu lực trong 1 phút.`
                    }

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log(error)
                            req.flash('flash', {
                                type: 'danger',
                                intro: 'Thông báo!',
                                message: `Lỗi hệ thống, vui lòng thử lại.`
                            })
                            return res.redirect("back")
                        }

                        req.flash('flash', {
                            type: 'success',
                            intro: 'Thông báo!',
                            message: `Vui lòng nhập mã OTP đã được gửi vào tài khoản email, có hiệu lực trong 1 phút.`
                        })

                        req.session.email = email

                        return res.redirect("/recovery2")
                    })
                })
                .catch(() => {
                    req.flash('flash', {
                        type: 'danger',
                        intro: 'Thất bại!',
                        message: 'Lỗi hệ thống, vui lòng thử lại!'
                    })

                    return res.redirect('back')
                })
        } else {
            req.flash('flash', {
                type: 'danger',
                intro: 'Thất bại!',
                message: 'Tài khoản email hoặc số điện thoại đăng ký không hợp lệ!'
            })
            return res.redirect('back')
        }
    }

    // [GET] /recovery2
    recovery2(req, res) {
        if (req.session.email) {
            const flash = req.flash('flash') || ''
            res.render('recovery2.hbs', { layout: 'emptyLayout', flash: flash[0] })
        } else {
            res.redirect('recovery')
        }
    }

    // [POST] /recovery2-otp
    async Recovery2OTP(req, res) {
        const { otpCode } = req.body
        const email = req.session.email

        const otp = await OTP.findOne({ id: email })

        if (otp) {
            if (otp.expiredAt < Date.now()) {
                req.session.user = ''
                await OTP.deleteOne({ id: email })

                return res.json(formatResponse(2, 'Mã OTP đã hết hạn, vui lòng thực hiện lại khôi phục mật khẩu'))
            } else {
                // So sánh mã otp
                const compareOTPCode = bcrypt.compareSync(otpCode, otp.otp)
                if (compareOTPCode) {
                    req.session.user = ''
                    await OTP.deleteOne({ id: email })

                    return res.json(formatResponse(0, 'Mã OTP hợp lệ'))
                } else {
                    return res.json(formatResponse(1, 'Mã OTP không hợp lệ'))
                }
            }
        } else {
            return res.json(formatResponse(1, 'Mã OTP không hợp lệ'))
        }
    }

    // [POST] /recovery2-password
    async Recovery2Password(req, res) {
        const { newPassword, confirmPassword } = req.body
        const email = req.session.email
        
        if (newPassword) {
            if (confirmPassword) {
                if (newPassword === confirmPassword) {
                    const salt = bcrypt.genSaltSync(10)
                    const hashNewPassword = bcrypt.hashSync(newPassword, salt)

                    await Account.updateOne({ email: email }, { password: hashNewPassword })

                    req.session.email = ''

                    return res.json(formatResponse(0, 'Khôi phục mật khẩu thành công'))
                } else {
                    return res.json(formatResponse(1, 'Mật khẩu xác thực không trùng khớp'))
                }
            } else {
                return res.json(formatResponse(1, 'Vui lòng xác thực mật khẩu mới'))
            }
        } else {
            return res.json(formatResponse(1, 'Vui lòng nhập mật khẩu mới'))
        }
    }

}

module.exports = new SiteController();
