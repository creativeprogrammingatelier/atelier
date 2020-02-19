/**
 * The main faile of express.js app
 * @author Andrew Heath
 */

/**
 * Dependencies
 */
import path from 'path';
import express, {Request, Response, Errback} from 'express';
import {Socket} from 'socket.io';

let createError = require('http-errors');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
// const mongoose = require('mongoose');
let usersRouter = require('./routes/UsersRouter');
let authRouter = require('./routes/AuthRouter');
import { router as filesRouter } from './routes/FilesRouter';
let commentRouter = require('./routes/CommentsRouter');
let indexRouter = require('./routes/IndexRouter');

// API routes
let courseRouter = require('./databaseRoutes/CourseRouter');
let coursesRouter = require('./databaseRoutes/CoursesRouter');
let fileRouter = require('./databaseRoutes/FileRouter');
let searchRouter = require('./databaseRoutes/SearchRouter');
let submissionRouter = require('./databaseRoutes/SubmissionRouter');
let userRouter = require('./databaseRoutes/UserRouter');


let app = express();
// app.listen(5000, () => console.log('Listening on port 5000!'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));

//Socket io
let http = require('http').createServer(app);
http.listen(5000, '127.0.0.1');
const socket: Socket = require('socket.io')(http);
app.set('socket-io', socket);

socket.on('connect', (socket: Socket) => {
	socket.emit('id', socket.id); // send each client their socket id
});
app.use(cookieParser());
/**
 * Adding default static
 */

app.use(express.static(path.join(__dirname, '../../client/')));
/**
 * Setting routes
 * IMPORTANT INSURE THAT INDEX IS ALWAYS LAST, as it has catch all
 */
app.use('/api/course', courseRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/file', fileRouter);
app.use('/api/search', searchRouter);
app.use('/api/submission', submissionRouter);
app.use('/api/user', userRouter);

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/files', filesRouter);
app.use('/comments', commentRouter);
app.use('/', indexRouter);


/**
 * Error handling 404
 * */

app.use(function(err: any, req: Request, res: Response, next: Function) {
	// Log the full error to the console, we want to see what went wrong...
	console.log('\x1b[31m', err);
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
// const mongo_uri = 'mongodb://localhost/react-auth';

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useUnifiedTopology', true);

// mongoose.connect(mongo_uri, function(err: Error) {
// 	if (err) {
// 		throw err;

// 	} else {
// 		console.log(`Successfully connected to ${mongo_uri}`);
// 	}
// });

module.exports = app;