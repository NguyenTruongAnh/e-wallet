const createError = require('http-errors');
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const handlebars = require('./util/handlebars')(exphbs);
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('express-flash');
const session = require('express-session')


const app = express();

const route = require('./routes')

const db = require('./config/db')

// Connect to Database
db.connect()

// view engine setup
app.engine('hbs', handlebars.engine)
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
