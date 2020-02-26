/**
 * The main faile of express.js app
 * @author Andrew Heath
 */

import express, { Request, Response } from 'express';
import { Socket } from 'socket.io';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

// API routes
import { authRouter } from './routes/AuthRouter';
import { courseRouter } from './routes/CourseRouter';
// import { coursesRouter } from './routes/CoursesRouter';
import { fileRouter } from './routes/FileRouter';
import { indexRouter } from './routes/IndexRouter';
import { searchRouter } from './routes/SearchRouter';
import { submissionRouter } from './routes/SubmissionRouter';
import { userRouter } from './routes/UserRouter';
import { commentThreadRouter} from './routes/CommentThreadRouter'
import {commentRouter} from "./routes/CommentRouter";
// import {filesRouter} from "./routes/FilesRouter";

export const app = express();
// app.listen(5000, () => console.log('Listening on port 5000!'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));

//Socket io
const http = require('http').createServer(app);
http.listen(5000, '127.0.0.1');
const socket: Socket = require('socket.io')(http);
app.set('socket-io', socket);

socket.on('connect', (socket: Socket) => {
	socket.emit('id', socket.id); // send each client their socket id
});
app.use(cookieParser());

const api404Router = express.Router();
const api404Response = (_: Request, response: Response) => response.status(404).send({error: "This API call does not exists"});
api404Router.get("*", api404Response);
api404Router.post("*", api404Response);
api404Router.put("*", api404Response);
api404Router.delete("*", api404Response);

app.use(express.static(path.join(__dirname, '../../client/')));
app.use('/api/auth', authRouter);
app.use('/api/comment', commentRouter);
app.use('/api/commentThread', commentThreadRouter);
app.use('/api/course', courseRouter);
// app.use('/api/courses', coursesRouter);
app.use('/api/file', fileRouter);
// app.use('/api/files', filesRouter);
app.use('/api/search', searchRouter);
app.use('/api/submission', submissionRouter);
app.use('/api/user', userRouter);
app.use('/api', api404Router);
app.use('/', indexRouter);

app.use((err: any, req: Request, res: Response, next: Function) => {
	// Log the full error to the console, we want to see what went wrong...
	console.log('\x1b[31m', err);
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500).json({
		error: err
	});
});
