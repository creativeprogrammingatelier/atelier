/**
 * The main faile of express.js app
 * @author Andrew Heath
 */

/**
 * Dependencies
 */
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var usersRouter = require('./routes/users');
var filesRouter = require('./routes/files');
var commentRouter = require('./routes/comments');
var indexRouter = require('./routes/index');


var app = express();
app.listen(5000, () => console.log('Listening on port 5000!'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
const secret = 'SECRET';
/**
 * Adding default static
 */
app.use(express.static(path.join(__dirname, '../client/')));
/**
 * Setting routes
 * IMPORTANT INSURE THAT INDEX IS ALWAYS LAST, as it has catch all 
 */
app.use('/', usersRouter);
app.use('/', filesRouter);
app.use('/', commentRouter);
app.use('/', indexRouter);


/**
 * Error handling 404
 * */

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).json({
    error: err
  });
});

//Databse connection 
/**
 * @TODO refactor
 */
const mongo_uri = 'mongodb://localhost/react-auth';
mongoose.connect(mongo_uri, function (err) {
  if (err) {
    throw err;

  } else {
    console.log(`Successfully connected to ${mongo_uri}`);
  }
});


module.exports = app;