/**
 * Api routes relating to comment threads
 */

import express, { Response, Request } from 'express';
import {threadState} from "../../../enums/threadStateEnum";
import {ThreadDB} from "../database/ThreadDB";
import {SnippetDB} from "../database/SnippetDB";
import {CommentDB} from "../database/CommentDB";

import {CommentThread} from "../../../models/api/CommentThread";
import {capture} from "../helpers/ErrorHelper";
import {DBTools, getClient} from "../database/HelperDB";
import {Snippet} from "../../../models/api/Snippet";

export const commentThreadRouter = express.Router();

/** ---------- GET REQUESTS ---------- */

/**
 * Get a specific comment thread.
 */
commentThreadRouter.get('/:commentThreadID', capture(async (request: Request, response : Response) => {
    const commentThreadID : string = request.params.commentThreadID;
    const thread : CommentThread = await ThreadDB.getThreadByID(commentThreadID);
    response.status(200).send(thread);
}));

/**
 * Get comment threads of a file
 */
commentThreadRouter.get('/file/:fileID', capture(async (request: Request, response : Response) => {
    const fileID = request.params.fileID;
    const commentThreads : CommentThread[] = await ThreadDB.getThreadsByFile(fileID);
    response.status(200).send(commentThreads);
}));

/**
 * Get comment threads of a submission (general project comments)
 */
commentThreadRouter.get('/submission/:submissionID', capture(async (request: Request, response: Response) => {
    const submissionID: string = request.params.submissionID;
    const commentThreads: CommentThread[] = await ThreadDB.getThreadsBySubmission(submissionID);
    response.status(200).send(commentThreads);
}));

/**
 * Get recent comment threads of project (limited)
 */
commentThreadRouter.get('/submission/:submissionID/recent', capture(async (request: Request, response: Response) => {
    const submissionID = request.params.submissionID;

    // TODO create DBTools object with limit, offset
    const limit = request.params.limit;
    const offset = request.params.offset;

    const commentThreads : CommentThread[] = await ThreadDB.getThreadsBySubmission(submissionID);
    response.status(200).send(commentThreads);
}));

/** ---------- POST REQUESTS ---------- */

/**
 * Create comment thread on a submission. General comment thread.
 */
commentThreadRouter.post('/submission/:submissionID', capture( async(request : Request, response : Response) => {
    const submissionID : string = request.params.submissionID;

    // TODO wait for database support: cannot pass parameters to ThreadDB.addThread
    // const client = await getClient();
    // try {
    //     await client.query('BEGIN');
    //     await ThreadDB.addThread({
    //
    //     }, {client : client});
    //     await client.query('COMMIT');
    // } catch (e) {
    //     await client.query('ROLLBACK');
    //     throw e;
    // } finally {
    //     client.release();
    // }
}));

/**
 * Create comment thread on a file.
 */
commentThreadRouter.post('/file/:fileID', capture(async (request : Request, response : Response) => {

    // Get url parameters
    const fileID = request.params.fileID;

    // Get body parameters
    const submissionID = request.body.submissionID;

    const lineStart = request.body.lineStart;
    const lineEnd = request.body.lineEnd;
    const charStart = request.body.charStart;
    const charEnd = request.body.charEnd;

    const body = request.body.body;

    console.log("Creating comment thread");
    console.log(`fileID:${fileID}`);
    console.log(`submissionID:${submissionID}`);
    console.log(`lineStart:${lineStart}`);
    console.log(`lineEnd:${lineEnd}`);
    console.log(`charStart:${charStart}`);
    console.log(`charEnd:${charEnd}`);
    console.log(`body:${body}`);

    // TODO create snippet
    // TODO create thread
    // TODO add comment
}));


