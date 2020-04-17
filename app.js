var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const WebSocket = require('ws')

express.init_ws = function(){
  const ws = new WebSocket.Server({
    port: 3030
  });
  express.ws = ws;
  express.ws.on('connection', ws => {
    express.websocket = ws;
    express.websocket.on('message', function (data) {
      data = JSON.parse(data)
      if (data.status == "ws_started") {
        express['start_streaming'] = true
        express.ws_past_write()
        express.ws_queue_write()
        console.log("Started streaming")
      }
    })
  })

  var ws_write_queue = []
  var ws_write_past = []

  express.ws_write = function (msg, err, sta) {
    let success = (!err & true)
    let data = {}
    if (success) {
      data = {
        status: sta || "success",
        message: msg
      }
    } else {
      data = {
        status: "error",
        error: err
      }
    }
    if (express.websocket && express['start_streaming']) {
      if (ws_write_queue.length > 0) {
        express.ws_queue_write()
      }
      express.websocket.send(JSON.stringify(data))
    } else {
      ws_write_queue.push(JSON.stringify(data))
    }
    ws_write_past.push(JSON.stringify(data))
  }
  express.ws_queue_write = function () {
    while (true) {
      write = ws_write_queue.shift()
      if (write == undefined || write == null) break;
      express.websocket.send(write)
    }
  }
  express.ws_past_write = function () {
    ws_write_past.forEach(write => {
      this.websocket.send(write)
    })
  }
}

//connecting database
mongoose.connect('mongodb://localhost/stock_auto', {
  userNewUrlParser: true //need to clarify
})
var db = mongoose.connection;
db.on('error', function(){
  throw new Error("Error in connecting to mongodb database")
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
