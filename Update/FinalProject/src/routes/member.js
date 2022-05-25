const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/UserController')
const { checkAuth, checkResetPassword } = require('../app/middlewares/checkLogin')

router.get('/card',checkAuth, checkResetPassword, userController.getCard)

router.get('/deposit',checkAuth, checkResetPassword, userController.getDeposit)

router.get('/transactions/:id',checkAuth, checkResetPassword, userController.getTransactionById)

router.get('/transactions',checkAuth, checkResetPassword, userController.getTransactions)

router.get('/transfer',checkAuth, checkResetPassword, userController.getTransfer)

router.get('/withdraw',checkAuth, checkResetPassword, userController.getWithdraw)

router.get('/change-password',checkAuth, checkResetPassword, userController.getChangePassword)

router.get('/logout',checkAuth, userController.logout)

router.get('/',checkAuth, checkResetPassword, userController.index)

module.exports = router;
