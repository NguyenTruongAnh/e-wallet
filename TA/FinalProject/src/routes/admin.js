const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/AdminController')
const { checkAdmin } = require('../app/middlewares/checkLogin')

// Đường dẫn trang chi tiết sách tài khoản
router.put('/accounts/:id', checkAdmin, adminController.updateStatus)

// Đường dẫn đến trang danh sách tài khoản
router.get('/accounts', checkAdmin, adminController.getAccounts)
  
// Đường dẫn đến trang chi tiết tài khoản
router.get('/accounts/:id', checkAdmin, adminController.getAccountById)

// Đường dẫn đến trang danh sách giao dịch
router.get('/transactions', checkAdmin, adminController.getTransactions)

// Đường dẫn đến trang chi tiết giao dịch
router.get('/transactions/:id', checkAdmin, adminController.getTransactionById)

module.exports = router;