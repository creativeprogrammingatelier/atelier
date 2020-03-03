/**
 * Api routes relating to comment threads
 */

import express, {Request, Response} from 'express';
import {threadState} from "../../../enums/threadStateEnum";
import {ThreadDB} from "../database/ThreadDB";
import {SnippetDB} from "../database/SnippetDB";

import {CommentThread} from "../../../models/api/CommentThread";
import {capture} from "../helpers/ErrorHelper";
import {getClient} from "../database/HelperDB";
import {FileDB} from "../database/FileDB";

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
    const nullFileID : string = await FileDB.getNullFileID(submissionID) as unknown as string;
    const commentThreads : CommentThread[] = await ThreadDB.getThreadsByFile(nullFileID);
    response.status(200).send(commentThreads);
}));

/**
 * Get recent comment threads of project (limited)
 */
commentThreadRouter.get('/submission/:submissionID/recent', capture(async (request: Request, response: Response) => {
    const submissionID = request.params.submissionID;
    const limit : number | undefined = request.headers.limit as unknown as number;
    const commentThreads : CommentThread[] = await ThreadDB.getThreadsBySubmission(submissionID, {limit : limit});
    response.status(200).send(commentThreads);
}));

/** ---------- POST REQUESTS ---------- */

/**
 * Create comment thread on a submission. General comment thread.
 */
commentThreadRouter.post('/submission/:submissionID', capture( async(request : Request, response : Response) => {
    // TODO create NullSnippet
    // TODO add thread with null snippet

    response.status(200).send({});
}));

/**
 * Create comment thread on a file.
 */
commentThreadRouter.post('/file/:fileID', capture(async (request : Request, response : Response) => {
    // const client = await getClient();
    // try {
    //     await client.query('BEGIN');
    //
    //     // Create snippet
    //     const body = request.body.body;
    //     const lineStart = request.body.lineStart;
    //     const lineEnd = request.body.lineEnd;
    //     const charStart = request.body.charStart;
    //     const charEnd = request.body.charEnd;
    //
    //     // TODO pass client when possible
    //     const snippetID : string = await SnippetDB.addSnippet({
    //         lineStart,
    //         lineEnd,
    //         charStart,
    //         charEnd,
    //         body
    //     });
    //
    //     // Create Thread
    //     const submissionID : string = request.body.submissionID;
    //     const fileID : string = request.params.fileID;
    //
    //     const thread : CommentThread = await ThreadDB.addThread({
    //         submissionID = submissionID,
    //         fileID = fileID,
    //         snippetID = snippetID,
    //         visibilityState = threadState.public,
    //     });
    //
    //     // Create Comment
    //     // TODO
    //     await client.query('COMMIT');
    // } catch (e) {
    //     await client.query('ROLLBACK');
    //     throw e;
    // } finally {
    //     client.release();
    // }

    response.status(200).send({});
}));


