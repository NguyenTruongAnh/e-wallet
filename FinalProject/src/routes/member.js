const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult,check } = require('express-validator')
const userController = require('../app/controllers/UserController')
const { checkAuth, checkResetPassword } = require('../app/middlewares/checkLogin')
const CreditCard = require('../app/models/CreditCard')
const User = require('../app/models/User');
const Account = require('../app/models/Account')
const Transaction = require('../app/models/Transaction')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/public/images/users");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage })
const cpUpload = upload.fields([{ name: 'idphoto1', maxCount: 1 }, { name: 'idphoto2', maxCount: 1 }])
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('flash', {
            type: 'danger',
            intro: 'Thông báo!',
            message: errors.array()[0].msg
        })
        console.log(errors.array()[0].msg)
        return res.redirect('back')
    }
    next()
}

router.get('/card',checkAuth, checkResetPassword, userController.getCard)

router.get('/deposit',checkAuth, checkResetPassword, userController.getDeposit)

const depositValidation = [
    check('idCard').notEmpty().withMessage('Vui lòng nhập số thẻ').isLength({max:6, min:6}).withMessage('Số thẻ phải có 6 số'),
    check('cvv').notEmpty().withMessage('Vui lòng nhập mã CVV!').isLength({min:3,max:3}).withMessage('Mã CVV có độ dài 3 kí tự'),
    check('expireDate').notEmpty().withMessage('Vui lòng chọn ngày hết hạn'),
    check('amount').notEmpty().withMessage('Vui lòng chọn số tiền cần nạp').isNumeric().withMessage('Vui lòng nhập số tiền là số'),
]

router.post('/deposit',checkAuth, checkResetPassword,depositValidation, (req,res)=>{
    let result = validationResult(req)
    const {idCard, cvv,expireDate,amount} = req.body
    if(result.errors.length === 0){
        let today = new Date().toISOString().split('T')[0]
       if(expireDate < today){
            req.flash('error','Ngày hết hạn không hợp lệ')
            return res.redirect('/deposit') 
       }
       if(amount <= 0){
        req.flash('error','Số tiền nạp phải lớn hơn 0đ')
        return res.redirect('/deposit') 
       }
       CreditCard.findOne({idCard : idCard, cvv : cvv},(err,card)=>{
           if(err){
                console.log(err)
           }else{
               if(!card){
                    req.flash('error','Thông tin thẻ không hợp lệ')
                    return res.redirect('/deposit') 
               }else{
                if(new Date(card.expireDate).toISOString().split('T')[0] !== expireDate){
                    req.flash('error','Thông tin thẻ không hợp lệ')
                    return res.redirect('/deposit')
                }
                console.log(card.idCard)
                switch(card.idCard) {
                    case '111111':
                        Account.findOne({phone: req.session.account.phone },(err,account)=>{
                            if(err){
                                console.log(err)
                            }else{
                                if(account){
                                    let newAmount = parseInt(account.amount) + parseInt(amount)
                
                                    Account.updateOne({phone: req.session.account.phone},{amount: newAmount},(err)=>{
                                        if(err){
                                            console.log(err)
                                        }else{
                                  
                                            var transaction = new Transaction({
                                                type: 'deposit',
                                                idCard: idCard,
                                                expireDate: expireDate,
                                                amount : amount,                              
                                                phone: req.session.account.phone
                                            })
                                            transaction.save().then(()=>{                                
                                                req.flash('amount', parseInt(amount))
                                                req.flash('idCard',idCard)
                                                req.session.transactionType = 'deposit'
                                                req.flash('time',new Date().toISOString().split('T')[0])
                                                req.flash('cvv',cvv)
                                                return res.redirect('/success')
                                            })
                                        }
                                    })
                                }
                            }
                        })
                      break;
                    case '222222':
                        if(parseInt(amount) > 1000000){
                            req.flash('error','Số tiền nạp vượt qua mức cho phép. Giao dịch không thành công')
                            return res.redirect('/deposit') 
                        }else{
                            Account.findOne({phone: req.session.account.phone},(err,account)=>{
                                if(err){
                                    console.log(err)
                                }else{
                                    if(account){
                                        let newAmount = parseInt(account.amount) + parseInt(amount)
                                        Account.updateOne({phone: req.session.account.phone},{amount: newAmount},(err)=>{
                                            if(err){
                                                console.log(err)
                                            }else{
                                         
                                                var transaction = new Transaction({
                                                    type: 'deposit',
                                                    idCard: idCard,
                                                    expireDate: expireDate,
                                                    amount : amount,
                                                    note: '',
                                                    fee: 0,
                                                   
                                                    phone: req.session.account.phone
                                                })
                                                transaction.save().then(()=>{
                                                    req.flash('flash', {
                                                        type: 'success',
                                                        intro: 'Thành công!',
                                                        message: `Nạp tiền thành công. Quý khách vui lòng kiểm tra lại số dư`
                                                    })
                                               
                                                    return res.redirect('/')
                                                })
                                            }
                                        })
                                    }
                                }
                            })
                        }
                      break;
                    case '333333':
                        req.flash('error','Số dư không khả dụng. Giao dịch không thành công')
                        return res.redirect('/deposit') 
                      break;
                 
                  }
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

        req.flash('error',message)
        return res.redirect('/deposit') 
    }
})
router.get('/success',checkAuth,checkResetPassword,userController.success)

router.get('/transactions/:id',checkAuth, checkResetPassword, userController.getTransactionById)

router.get('/transactions',checkAuth, checkResetPassword, userController.getTransactions)

router.get('/transfer',checkAuth, checkResetPassword, userController.getTransfer)

router.get('/withdraw',checkAuth, checkResetPassword, userController.getWithdraw)

const withdrawValidation = [
    check('idCard').notEmpty().withMessage('Vui lòng nhập số thẻ').isLength({max:6, min:6}).withMessage('Số thẻ phải có 6 số'),
    check('cvv').notEmpty().withMessage('Vui lòng nhập mã CVV!').isLength({min:3,max:3}).withMessage('Mã CVV có độ dài 3 kí tự'),
    check('expireDate').notEmpty().withMessage('Vui lòng chọn ngày hết hạn'),
    check('amount').notEmpty().withMessage('Vui lòng chọn số tiền cần nạp').isNumeric().withMessage('Vui lòng nhập số tiền là số'),
]

router.post('/withdraw',checkAuth, checkResetPassword,withdrawValidation, (req,res)=>{
    let result = validationResult(req)
    const {idCard, cvv,expireDate,amount} = req.body
    const note = req.body.note || ''
    if(result.errors.length === 0){
        let today = new Date().toISOString().split('T')[0]
       if(expireDate < today){
            req.flash('error','Ngày hết hạn không hợp lệ')
            return res.redirect('/deposit') 
       }
       if(amount <= 0){
        req.flash('error','Số tiền nạp phải lớn hơn 0đ')
        return res.redirect('/withdraw') 
       }
       CreditCard.findOne({idCard : idCard, cvv : cvv},(err,card)=>{
           if(err){
                console.log(err)
           }else{
               if(!card){
                    req.flash('error','Thông tin thẻ không hợp lệ')
                    return res.redirect('/withdraw') 
               }else{
                if(new Date(card.expireDate).toISOString().split('T')[0] !== expireDate){
                    req.flash('error','Thông tin thẻ không hợp lệ')
                    return res.redirect('/withdraw')
                }
                console.log(card.idCard)
                switch(card.idCard) {
                    case '111111':
                        Account.findOne({phone: req.session.account.phone },(err,account)=>{
                            if(err){
                                console.log(err)
                            }else{
                                if(account){
                                    if(parseInt(amount) % 50000 !== 0){
                                        req.flash('error','Số tiền rút phải là bội số của 50.000đ')
                                        return res.redirect('/withdraw')
                                    }
                                    let today = new Date().toISOString()
                                    Transaction.find({phone: req.session.account.phone, createAt :  today,type: 'withdraw'},(err,docs)=>{    
                                        if(docs.length >= 2){
                                            req.flash('error','Số lần giao dịch rút tiền trong ngày của tài khoản này đã đạt hạn mức quy định.')
                                            return res.redirect('/withdraw')
                                        }else{
                                            let newAmount = parseInt(account.amount) - parseInt(amount)
                                            if(newAmount < 0){
                                                req.flash('error','Số dư không khả dụng')
                                                return res.redirect('/withdraw')
                                            }
                                            newAmount = newAmount - parseInt(amount) * 0.05
                                            if(parseInt(amount) > 5000000){
                                                var transaction = new Transaction({
                                                    type: 'withdraw',
                                                    idCard: idCard,
                                                    expireDate: expireDate,
                                                    amount : amount,
                                                    note: note,
                                                
                                                    status: 'pending',                                      
                                                    fee: parseInt(amount) * 0.05,
                                                    phone: req.session.account.phone
                                                })
                                                transaction.save(()=>{
                                                    req.flash('amount', parseInt(amount))
                                                    req.flash('idCard',idCard)
                                                    req.session.transactionType = 'pending'
                                                    req.flash('time',new Date().toISOString().split('T')[0])
                                                    req.flash('cvv',cvv)
                                                    return res.redirect('/success')
                                                })
                                            }else{
                                            Account.updateOne({phone: req.session.account.phone},{amount: newAmount},(err)=>{
                                                if(err){
                                                    console.log(err)
                                                }else{
                                                    req.session.account.amount = newAmount
                                                    var transaction = new Transaction({
                                                        type: 'withdraw',
                                                        idCard: idCard,
                                                        expireDate: expireDate,
                                                        amount : amount,
                                                        note: note,
                                                
                                                        fee: parseInt(amount) * 0.05,
                                                        phone: req.session.account.phone
                                                    })
                                                    transaction.save(()=>{
                                                        req.flash('amount', parseInt(amount))
                                                        req.flash('idCard',idCard)
                                                        req.session.transactionType = 'approved'
                                                        req.flash('time',new Date().toISOString().split('T')[0])
                                                        req.flash('cvv',cvv)
                                                        return res.redirect('/success')
                                                    })
                                                }
                                            })
                                            }
                                        }   
                                    })                 
                                }
                            }
                        })
                      break;
                    case '222222':
                        req.flash('error','Thẻ này không được hỗ trợ để rút tiền')
                        return res.redirect('/withdraw') 
                      break;
                    case '333333':
                        req.flash('error','Thẻ này không được hỗ trợ để rút tiền')
                        return res.redirect('/withdraw') 
                      break;         
                  }
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

        req.flash('error',message)
        return res.redirect('/deposit') 
    }
})
router.get('/change-password',checkAuth, checkResetPassword, userController.getChangePassword)

router.get('/logout',checkAuth, userController.logout)

router.get('/',checkAuth, checkResetPassword, userController.index)



router.post('/update-img',checkAuth, checkResetPassword,cpUpload, body('idphoto1').custom((value, { req }) => {
    if(!req.files['idphoto1']) {
        throw new Error('Vui lòng tải ảnh mặt trước CMND/CCCD!')
    }
    let extension = req.files['idphoto1'][0].filename.split('.')[1].toLowerCase()
    if(extension !== 'jpg' && extension !== 'jpeg' && extension !== 'png') {
        throw new Error('Vui lòng tải file là file hình ảnh!')
    }
    return true
}),
body('idphoto2').custom((value, { req }) => {
    if(!req.files['idphoto2']) {
        throw new Error('Vui lòng tải ảnh mặt sau CMND/CCCD!')
    }
    let extension = req.files['idphoto2'][0].filename.split('.')[1].toLowerCase()
    if(extension !== 'jpg' && extension !== 'jpeg' && extension !== 'png') {
        throw new Error('Vui lòng tải file là file hình ảnh!')
    }
    return true
}), handleValidation, userController.updateImg)


module.exports = router;
