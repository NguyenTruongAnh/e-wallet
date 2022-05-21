var createError = require('http-errors');
var express = require('express');
var path = require('path');
var handlebars = require('express-handlebars');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var route = require('./routes')

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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
