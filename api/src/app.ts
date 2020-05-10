import cookieParser from 'cookie-parser';
import express, {Request, Response, NextFunction} from 'express';
import http from 'http';
import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import socketio, {Socket} from 'socket.io';

import {AuthError} from './helpers/AuthenticationHelper';
import {config} from './helpers/ConfigurationHelper';
import {parsePostgresErrorCode, isPostgresError, PostgresError} from './helpers/DatabaseErrorHelper';
import {InvalidParamsError} from './helpers/ParamsHelper';
import {PermissionError} from "./helpers/PermissionHelper";
import {ProjectValidationError} from '../../helpers/ProjectValidationHelper';
import {logger, httpLoggerOptions} from './helpers/LoggingHelper';

import {NotFoundDatabaseError} from './database/DatabaseErrors';
import {AuthMiddleware} from './middleware/AuthMiddleware';

// API routes
import {authRouter} from './routes/authentication/AuthRouter';
import {clientLoggingRouter} from './routes/ClientLoggingRouter';
import {commentRouter} from './routes/CommentRouter';
import {commentThreadRouter} from './routes/CommentThreadRouter'
import {courseRouter} from './routes/CourseRouter';
import {fileRouter} from './routes/FileRouter';
import {indexRouter} from './routes/IndexRouter';
import {inviteRouter} from "./routes/InviteRouter";
import {mentionsRouter} from './routes/MentionsRouter';
import {roleRouter} from './routes/RoleRouter';
import {searchRouter} from './routes/SearchRouter';
import {submissionRouter} from './routes/SubmissionRouter';
import {permissionRouter} from './routes/PermissionRouter';
import {pluginRouter} from './routes/PluginRouter';
import {userRouter} from './routes/UserRouter';

/**
 * The main file of express.js app
 * @author Andrew Heath, Arthur Rump, Jarik Karsten, Cas Sievers, Rens Leendertz, Alexander Haas
 */

export const app = express();

// Set up server and start listening on configured port and hostname
const server = http.createServer(app);
server.listen(config.port, config.hostname);

// Set up Socket.io
const socket = socketio(server);
app.set('socket-io', socket);
socket.on('connect', (socket: Socket) => {
    // send each client their socket id
    socket.emit('id', socket.id); 
});

// Add logger if this file is ran as the main program
if (require.main === module) {
    app.use(pinoHttp(httpLoggerOptions));
} else {
    // Otherwise, disable logging in requests
    app.use(pinoHttp({
        logger: pino({ enabled: false })
    }));
}

// Use express json and url parsing
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// Use the cookieParser middleware to parse cookies
app.use(cookieParser());

// Refresh token cookies when they are provided and getting old
app.use(AuthMiddleware.refreshCookieToken);

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../../client/')));

// Define all API endpoints
app.use('/api/auth', authRouter);
app.use('/api/clientLogging', clientLoggingRouter);
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

// Give a 404 in case the API route does not exist
app.all('/api/*', (_, response) => response.status(404).send({
    error: "route.notfound",
    message: "This is not a valid API endpoint."
}));

// The index router catches all other request, serving the frontend
app.use('/', indexRouter);

// Handle all errors thrown in the pipeline
app.use((error: Error, request: Request, response: Response, next: NextFunction) => {
    if (error instanceof AuthError) {
        request.log.info("Authentication error: %s", error.reason);
        response.status(401).send({error: error.reason, message: error.message});
    } else if (error instanceof PermissionError) {
        request.log.info("Permission error: %s", error.reason);
        response.status(401).send({error: error.reason, message: error.message});
    } else if (error instanceof NotFoundDatabaseError) {
        request.log.info({error}, "Requested item not found in the database");
        response.status(404).send({error: "item.notfound", message: "The requested item could not be found."});
    } else if (error instanceof InvalidParamsError) {
        request.log.info("Invalid parameters supplied: %s", error.reason)
        response.status(400).send({error: error.reason, message: error.message});
    } else if (error instanceof ProjectValidationError) {
        request.log.warning({error}, "An invalid project was uploaded: %s", error.message);
        response.status(400).send({error: "project.invalid", message: error.message});
    } else if (error instanceof Error && isPostgresError(error)) {
        const code = parsePostgresErrorCode(error as PostgresError);
        request.log.error({error}, "An unforeseen error happened with the database: %s", code);
        response.status(500).send({error: code, message: "Something went wrong while connecting to the database."});
    } else {
        request.log.error({error}, "An unknown error occured: %s", error.message);
        response.status(500).send({error: "unknown", message: "Something went wrong. Please try again later."});
    }
});

// Handle errors that were not caught in the pipeline
// This really shouldn't happen, it means requests will go unanswered
process.on('unhandledRejection', error => {
    logger.fatal({error}, "Unhandled rejection. (A request has not been answered.)");
});

logger.info("Server started.");