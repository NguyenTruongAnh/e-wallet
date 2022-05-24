var express = require('express');
var router = express.Router();
const SiteController = require('../app/controllers/SiteController')
const Accounts = require('../app/models/Account')
const Users = require('../app/models/User')
const {check, validationResult} = require('express-validator');
const User = require('../app/models/User');
router.get('/',(req,res)=>{
    res.send('user')
})
const recoveryValidation = [
    check('email').exists().withMessage('Vui lòng nhập email đã đăng ký').notEmpty().withMessage('Không được để trống email').isEmail().withMessage('Email không hợp lệ'),
    check('phone').exists().withMessage('Vui lòng nhập số điện thoại đã đăng ký').notEmpty().withMessage('Không được để trống số điện thoại').isLength({max: 10, min:10}).withMessage('Số điện thoại không hợp lệ')
]
router.post('/recovery',recoveryValidation,(req,res)=>{
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
                    //pass
                    return res.redirect('/recovery2')
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



})
module.exports = router