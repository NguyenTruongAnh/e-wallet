var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
})

router.get('/login', function(req, res, next) {
    res.render('login.hbs', { layout: 'main3' })
})

router.get('/register', function(req, res, next) {
  res.render('register.hbs', { layout: 'main3' })
})

router.get('/recovery', function(req, res, next) {
  res.render('recovery.hbs', { layout: 'main3' })
})

router.get('/recovery2', function(req, res, next) {
  res.render('recovery2.hbs', { layout: 'main3' })
})

router.get('/reset-password', function(req, res, next) {
  res.render('reset-password.hbs', { layout: 'main3' })
})

// Đường dẫn đến trang danh sách tài khoản
router.get('/admin/accounts', function(req, res, next) {
  res.render('admin/account/index.hbs', { layout: 'main2', active: 'active--account' })
})

// Đường dẫn đến trang chi tiết tài khoản
router.get('/admin/accounts/:id', function(req, res, next) {
  res.render('admin/account/detail.hbs', { layout: 'main2', active: 'active--account' })
})

// Đường dẫn đến trang danh sách giao dịch
router.get('/admin/transactions', function(req, res, next) {
  res.render('admin/transaction/index.hbs', { layout: 'main2', active: 'active--transaction' })
})

// Đường dẫn đến trang chi tiết giao dịch
router.get('/admin/transactions/:id', function(req, res, next) {
  res.render('admin/transaction/detail.hbs', { layout: 'main2', active: 'active--transaction' })
})

router.get('/member/card', function(req, res, next) {
  res.render('member/card.hbs', { layout: 'memberlayout' })
})

router.get('/member/deposit-form', function(req, res, next) {
  res.render('member/deposit-form.hbs', { layout: 'memberlayout' })
})

router.get('/member/detailtransaction', function(req, res, next) {
  res.render('member/detailtransaction.hbs', { layout: 'memberlayout' })
})

router.get('/member/index', function(req, res, next) {
  res.render('member/index.hbs', { layout: 'memberlayout' })
})

router.get('/member/profile', function(req, res, next) {
  res.render('member/profile.hbs', { layout: 'memberlayout' })
})

router.get('/member/transactionhistory', function(req, res, next) {
  res.render('member/transactionhistory.hbs', { layout: 'memberlayout' })
})

router.get('/member/transfer', function(req, res, next) {
  res.render('member/transfer.hbs', { layout: 'memberlayout' })
})

router.get('/member/withdraw', function(req, res, next) {
  res.render('member/withdraw.hbs', { layout: 'memberlayout' })
})

module.exports = router;
