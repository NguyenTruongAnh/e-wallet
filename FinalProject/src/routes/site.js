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

module.exports = router;
