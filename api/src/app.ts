/**
 * The main faile of express.js app
 * @author Andrew Heath
 */

/**
 * Dependencies
 */
import path from "path"
import express from 'express';
import { Socket } from "socket.io";
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
var usersRouter = require('./routes/UsersRouter');
var authRouter = require('./routes/AuthRouter');
var filesRouter = require('./routes/FilesRouter');
var commentRouter = require('./routes/CommentsRouter');
var indexRouter = require('./routes/IndexRouter');


var app = express();
// app.listen(5000, () => console.log('Listening on port 5000!'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

//Socket io
var http = require('http').createServer(app);
http.listen(5000, "127.0.0.1");
const socket: Socket = require('socket.io')(http);
app.set('socket-io', socket);

socket.on('connect', (socket: Socket) => {
  socket.emit('id', socket.id) // send each client their socket id
})

app.use(cookieParser());
/**
 * Adding default static
 */
app.use(express.static(path.join(__dirname, '../../client/')));
/**
 * Setting routes
 * IMPORTANT INSURE THAT INDEX IS ALWAYS LAST, as it has catch all 
 */
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/files', filesRouter);
app.use('/comments', commentRouter);
app.use('/', indexRouter);


/**
 * Error handling 404
 * */

app.use(function (err:any, req:any, res:any, next:any) {
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
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(mongo_uri, function (err:any) {
  if (err) {
    throw err;

  } else {
    console.log(`Successfully connected to ${mongo_uri}`);
  }
});

module.exports = app;