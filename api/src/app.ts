/**
 * The main faile of express.js app
 * @author Andrew Heath
 */

/**
 * Dependencies
 */
import path from 'path';
import express, { Request, Response } from 'express';
import { Socket } from 'socket.io';

import cookieParser from 'cookie-parser';
import logger from 'morgan';

// API routes
import { courseRouter } from './routes/CourseRouter';
import { coursesRouter } from './routes/CoursesRouter';
import { fileRouter } from './routes/FileRouter';
import { indexRouter } from './routes/IndexRouter';
import { searchRouter } from './routes/SearchRouter';
import { submissionRouter } from './routes/SubmissionRouter';
import { userRouter } from './routes/UserRouter';


export const app = express();
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
app.use('/', indexRouter);

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
