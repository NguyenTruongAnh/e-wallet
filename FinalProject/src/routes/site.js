const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator')
const siteController = require('../app/controllers/SiteController')
const { checkAuth, checkAuth2 } = require('../app/middlewares/checkLogin')
const multer = require('multer');
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
        return res.redirect('back')
    }
    next()
}

router.post('/login', checkAuth2,
            body('username').notEmpty().withMessage('Vui lòng nhập tên tài khoản!'),
            body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu!'),
            handleValidation,
            siteController.checkLogin)

router.post('/register',checkAuth2, cpUpload, 
            body('phone').notEmpty().withMessage('Vui lòng nhập số điện thoại!')
            .custom(value => {
                if(!/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(value)) {
                    throw new Error('Vui lòng nhập số điện thoại hợp lệ!')
                }
                return true
            }),
            body('email').notEmpty().withMessage('Vui lòng nhập email!')
            .isEmail().withMessage('Vui lòng nhập email hợp lệ!'),
            body('name').notEmpty().withMessage('Vui lòng nhập họ tên!'),
            body('birthday').notEmpty().withMessage('Vui lòng chọn ngày sinh!')
            .custom(value => {
                const date18YAgo = new Date();
                const dateOfBirth = new Date(value)
                date18YAgo.setFullYear(date18YAgo.getFullYear() - 18);
                if(date18YAgo < dateOfBirth) {
                    throw new Error('Bạn chưa đủ 18 tuổi!')
                }
                return true
            }),
            body('address').notEmpty().withMessage('Vui lòng nhập địa chỉ!'),
            body('idphoto1').custom((value, { req }) => {
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
            }),
            handleValidation, 
            siteController.Register)

router.get('/login',checkAuth2, siteController.login)

router.get('/register',checkAuth2, siteController.register)

router.get('/recovery',checkAuth2, siteController.recovery)

router.get('/recovery2',checkAuth2, siteController.recovery2)

router.get('/reset-password', checkAuth, siteController.resetPassword)

module.exports = router;
