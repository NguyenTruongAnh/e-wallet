var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
})

router.get('/login', function(req, res, next) {
    res.render('client/login.hbs', { layout: 'main3' })
})

router.get('/register', function(req, res, next) {
  res.render('client/register.hbs', { layout: 'main3' })
})

router.get('/recovery', function(req, res, next) {
  res.render('client/recovery.hbs', { layout: 'main3' })
})

router.get('/recovery2', function(req, res, next) {
  res.render('client/recovery2.hbs', { layout: 'main3' })
})

router.get('/reset-password', function(req, res, next) {
  res.render('client/reset-password.hbs', { layout: 'main3' })
})

module.exports = router;
