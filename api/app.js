var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var filesRouter = require('./routes/files');

var app = express();
app.listen(5000, () => console.log('Listening on port 5000!'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
const secret = 'SECRET';

app.use(express.static(path.join(__dirname, '../client/')));

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', filesRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).json({
    error: err
  });

});

//Databse connection 
const mongo_uri = 'mongodb://localhost/react-auth';
mongoose.connect(mongo_uri, function (err) {
  if (err) {
    throw err;

  } else {
    console.log(`Successfully connected to ${mongo_uri}`);
  }
});


module.exports = app;