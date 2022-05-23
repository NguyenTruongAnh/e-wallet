var createError = require('http-errors');
var express = require('express');
var path = require('path');
var handlebars = require('express-handlebars');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('express-flash');
var session = require('express-session')


var app = express();

var route = require('./routes')

var db = require('./config/db')

// Connect to Database
db.connect()

// view engine setup
app.engine(
  'hbs',
  handlebars.engine({
      extname: '.hbs',
      helpers: {
          sum: (a, b) => a + b,
          formatMoney: (a) => {
              const formatter = new Intl.NumberFormat('vi-VN')

              return formatter.format(a)
          },
          equal: (lvalue, rvalue, options) => {
              if (lvalue === rvalue) {
                  return options.fn(this)
              } else {
                  return options.inverse(this)
              }
          },
      }
  }),
)
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'resources' ,'views'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('Cookie Secret', { maxAge: null }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    name: 'AVAT',
    secret: 'AVAT wallet!',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },
}));
app.use(flash());

route(app)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
