var express = require('express');
var router = express.Router();

router.get('/login', function(req, res, next) {
    res.render('login.hbs', { layout: 'emptyLayout' })
})

router.get('/register', function(req, res, next) {
  res.render('register.hbs', { layout: 'emptyLayout' })
})

router.get('/recovery', function(req, res, next) {
  res.render('recovery.hbs', { layout: 'emptyLayout' })
})

router.get('/recovery2', function(req, res, next) {
  res.render('recovery2.hbs', { layout: 'emptyLayout' })
})

router.get('/reset-password', function(req, res, next) {
  res.render('reset-password.hbs', { layout: 'emptyLayout' })
})

// Đường dẫn đến trang danh sách tài khoản
router.get('/admin/accounts', function(req, res, next) {
  res.render('admin/account/index.hbs', { layout: 'adminLayout', active: 'active--account' })
})

// Đường dẫn đến trang chi tiết tài khoản
router.get('/admin/accounts/:id', function(req, res, next) {
  res.render('admin/account/detail.hbs', { layout: 'adminLayout', active: 'active--account' })
})

// Đường dẫn đến trang danh sách giao dịch
router.get('/admin/transactions', function(req, res, next) {
  res.render('admin/transaction/index.hbs', { layout: 'adminLayout', active: 'active--transaction' })
})

// Đường dẫn đến trang chi tiết giao dịch
router.get('/admin/transactions/:id', function(req, res, next) {
  res.render('admin/transaction/detail.hbs', { layout: 'adminLayout', active: 'active--transaction' })
})

router.get('/card', function(req, res, next) {
  res.render('member/card.hbs', { layout: 'memberlayout' })
})

router.get('/deposit', function(req, res, next) {
  res.render('member/deposit.hbs', { layout: 'memberlayout' })
})

router.get('/transactions/:id', function(req, res, next) {
  res.render('member/detailtransaction.hbs', { layout: 'memberlayout' })
})

router.get('/transactions', function(req, res, next) {
  res.render('member/transactionhistory.hbs', { layout: 'memberlayout' })
})

router.get('/transfer', function(req, res, next) {
  res.render('member/transfer.hbs', { layout: 'memberlayout' })
})

router.get('/withdraw', function(req, res, next) {
  res.render('member/withdraw.hbs', { layout: 'memberlayout' })
})

router.get('/change-password', function(req, res, next) {
  res.render('member/password.hbs', { layout: 'memberlayout' })
})

router.get('/', function(req, res, next) {
  res.render('member/profile.hbs', { layout: 'memberlayout' })
})

module.exports = router;
