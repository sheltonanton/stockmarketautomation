var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var fs = require('fs');

fs.readFile('config.txt', 'utf-8', function(err, data){
  var data = data.split("\r\n");
  //connecting database
  mongoose.connect(data[0], {
    useNewUrlParser: true, //need to clarify
    useUnifiedTopology: true
  })
  var db = mongoose.connection;
  db.on('error', function () {
    throw new Error("Error in connecting to mongodb database")
  })
})

var app = express();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var autoRouter  = require('./routes/auto');
var orderRouter = require('./routes/order');
var stratRouter = require('./routes/strategies');
var tradeRouter = require('./routes/trades');
var entryRouter = require('./routes/entries');
var stockRouter = require('./routes/stocks');
var eventRouter = require('./routes/events');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auto', autoRouter);
app.use('/order', orderRouter);
app.use('/strategies', stratRouter);
app.use('/trades', tradeRouter);
app.use('/entries', entryRouter);
app.use('/stocks', stockRouter);
app.use('/events', eventRouter);
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
