/**
 * The main faile of express.js app
 * @author Andrew Heath
 */

import { config } from './helpers/ConfigurationHelper';

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import socketio, { Socket } from 'socket.io';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

// API routes
import { authRouter } from './routes/authentication/AuthRouter';
import { pluginRouter } from './routes/PluginRouter';
import { courseRouter } from './routes/CourseRouter';
import { fileRouter } from './routes/FileRouter';
import { indexRouter } from './routes/IndexRouter';
import { searchRouter } from './routes/SearchRouter';
import { submissionRouter } from './routes/SubmissionRouter';
import { userRouter } from './routes/UserRouter';
import { commentThreadRouter} from './routes/CommentThreadRouter'
import { commentRouter } from './routes/CommentRouter';
import { permissionRouter } from './routes/PermissionRouter';
import { roleRouter } from './routes/RoleRouter';
import { mentionsRouter } from './routes/MentionsRouter';

import { NotFoundDatabaseError } from './database/DatabaseErrors';
import { parsePostgresErrorCode, isPostgresError, PostgresError } from './helpers/DatabaseErrorHelper';
import { AuthError } from './helpers/AuthenticationHelper';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import { ProjectValidationError } from '../../helpers/ProjectValidationHelper';
import { InvalidParamsError } from './helpers/ParamsHelper';
import {inviteRouter} from "./routes/InviteRouter";
import {inviteLinkRouter} from "./routes/InviteLinkRouter";
import {PermissionError} from "./helpers/PermissionHelper";

export const app = express();
// app.listen(5000, () => console.log('Listening on port 5000!'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));

//Socket io
const server = http.createServer(app);
server.listen(config.port, config.hostname);
const socket = socketio(server);
app.set('socket-io', socket);

socket.on('connect', (socket: Socket) => {
	socket.emit('id', socket.id); // send each client their socket id
});

app.use(cookieParser());

app.use(AuthMiddleware.refreshCookieToken);

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../../client/')));

// Define all API endpoints
app.use('/api/auth', authRouter);
app.use('/api/comment', commentRouter);
app.use('/api/commentThread', commentThreadRouter);
app.use('/api/course', courseRouter);
app.use('/api/file', fileRouter);
app.use('/api/invite', inviteRouter);
app.use('/api/mentions', mentionsRouter);
app.use('/api/permission', permissionRouter);
app.use('/api/plugin', pluginRouter);
app.use('/api/role', roleRouter);
app.use('/api/search', searchRouter);
app.use('/api/submission', submissionRouter);
app.use('/api/user', userRouter);
app.use('/invite', inviteLinkRouter);

// Give a 404 in case the API route does not exist
app.all('/api/*', (_, response) => response.status(404).send({ error: "route.notfound", message: "This is not a valid API endpoint." }));

// The index router catches all other request, serving the frontend
app.use('/', indexRouter);

// Handle all errors thrown in the pipeline
app.use((error: Error, request: Request, response: Response, next: NextFunction) => {
	// Log the full error to the console, we want to see what went wrong...
	console.log('\x1b[31m', error);
    
    if (error instanceof AuthError) {
        response.status(401).redirect('/login');
        //response.status(401).send({ error: error.reason, message: error.message });
    } else if (error instanceof PermissionError){
        response.status(401).send({error : error.reason, message : error.message});
    } else if (error instanceof NotFoundDatabaseError) {
        response.status(404).send({ error: "item.notfound", message: "The requested item could not be found." });
    } else if (error instanceof InvalidParamsError) {
        response.status(400).send({ error: error.reason, message: error.message });
    } else if (error instanceof ProjectValidationError) {
        response.status(400).send({ error: "project.invalid", message: error.message });
    } else if (error instanceof Error && isPostgresError(error)) {
        const code = parsePostgresErrorCode(error as PostgresError);
        response.status(500).send({ error: code, message: "Something went wrong while connecting to the database." });
    } else {
        response.status(500).send({ error: "unknown", message: "Something went wrong. Please try again later." });
    }
});

// Handle errors that were not caught in the pipeline
// This really shouldn't happen, it means requests will go unanswered
process.on('unhandledRejection', error => {
    console.log('\x1b[31mCRITICAL (Unhandled rejection): ', error);
});

console.log("Server started.");