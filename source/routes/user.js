const express = require('express');
const router = express.Router();
const userController = require('../app/controllers/UserController')
const { body, validationResult } = require('express-validator')
const { checkAuth, checkResetPassword, checkAccountStatus } = require('../app/middlewares/check')
const { formatResponse } = require('../util/response')
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images/users");
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
        return res.json(formatResponse(1, errors.array()[0].msg))
    }
    next()
}

router.put('/profile-update', checkAuth, cpUpload, userController.profileUpdate)

router.put('/change-password', checkAuth,
    body('oldPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu cũ.'),
    body('newPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu mới.'),
    body('retypePassword').notEmpty().withMessage('Vui lòng nhập xác thực mật khẩu mới.')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword)
                throw new Error('Vui lòng nhập xác thực mật khẩu mới giống với mật khẩu mới.')
            return true
        }),
    handleValidation,
    userController.changePassword)

// Mua card điện thoại
router.post('/card', checkAuth,
    body('name').notEmpty().withMessage('Vui lòng chọn nhà mạng!')
        .custom(value => {
            const nameCardPhones = ['viettel', 'mobifone', 'vinaphone']
            if (!nameCardPhones.includes(value.toLowerCase())) {
                throw new Error('Nhà mạng không được hỗ trợ!')
            }
            return true
        }),
    body('type').notEmpty().withMessage('Vui lòng chọn mệnh giá!')
        .custom(value => {
            const typeCardPhones = [10000, 20000, 50000, 100000]
            if (!typeCardPhones.includes(parseInt(value))) {
                throw new Error('Mệnh giá không được hỗ trợ!')
            }
            return true
        }),
    body('number').notEmpty().withMessage('Vui lòng chọn số lượng!')
        .custom(value => {
            value = parseInt(value)
            if (value < 1 || value > 5) {
                throw new Error('Số lượng một lần mua phải từ 1 -> 5 thẻ!')
            }
            return true
        }),
    handleValidation,
    userController.postCard)

// Nạp tiền
router.post('/deposit', checkAuth,
    body('idCard').notEmpty().withMessage('Vui lòng nhập số thẻ.')
        .isLength({ min: 6, max: 6 }).withMessage('Vui lòng nhập số thẻ gồm 6 chữ số.'),
    body('cvv').notEmpty().withMessage('Vui lòng nhập mã CVV.')
        .isLength({ min: 3, max: 3 }).withMessage('Vui lòng nhập mã CVV gồm 3 chữ số.'),
    body('expireDate').notEmpty().withMessage('Vui lòng nhập ngày hết hạn.'),
    body('amount').notEmpty().withMessage('Vui lòng nhập số tiền.')
        .custom(value => {
            if (value <= 0)
                throw new Error('Vui lòng nhập số tiền lớn hơn 0.')
            return true
        }),
    handleValidation,
    userController.deposit)

// Xác thực chuyển tiền
router.post('/transfer-confirm', checkAuth, userController.confirmTranfer)

// Chuyển tiền
router.post('/transfer', checkAuth,
    body('receiverPhone').notEmpty().withMessage('Vui lòng nhập số điện thoại!')
        .custom(value => {
            if (!/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(value)) {
                throw new Error('Vui lòng nhập số điện thoại hợp lệ!')
            }
            return true
        }),
    body('amount').notEmpty().withMessage('Vui lòng nhập số tiền cần chuyển!')
        .custom(value => {
            if (parseInt(value) < 1000) {
                throw new Error('Số tiền cần chuyển tối thiểu phải từ 1.000đ')
            }
            return true
        }),
    handleValidation,
    userController.postTransfer)

// Rút tiền
router.post('/withdraw', checkAuth,
    body('cardId').notEmpty().withMessage('Vui lòng nhập số thẻ!'),
    body('cardCVV').notEmpty().withMessage('Vui lòng nhập mã CVV của thẻ!'),
    body('expiredDate').notEmpty().withMessage('Vui lòng nhập ngày hết hạn của thẻ!'),
    body('amount').notEmpty().withMessage('Vui lòng nhập số tiền muốn rút!')
        .custom(value => {
            if (parseInt(value) < 50000) {
                throw new Error('Số tiền rút tối thiểu phải từ 50.000đ')
            }

            if (parseInt(value) % 50000 !== 0) {
                throw new Error('Số tiền rút phải là bội số của 50.000đ')
            }
            return true
        }),
    handleValidation,
    userController.postWithdraw)

router.get('/card', checkAuth, checkResetPassword, checkAccountStatus, userController.getCard)

router.get('/deposit', checkAuth, checkResetPassword, checkAccountStatus, userController.getDeposit)

router.get('/transactions/:id', checkAuth, checkResetPassword, checkAccountStatus, userController.getTransactionById)

router.get('/transactions', checkAuth, checkResetPassword, checkAccountStatus, userController.getTransactions)

router.get('/transfer', checkAuth, checkResetPassword, checkAccountStatus, userController.getTransfer)

router.get('/withdraw', checkAuth, checkResetPassword, checkAccountStatus, userController.getWithdraw)

router.get('/change-password', checkAuth, checkResetPassword, userController.getChangePassword)

router.get('/logout', checkAuth, userController.logout)

router.get('/', checkAuth, checkResetPassword, userController.index)

module.exports = router;
