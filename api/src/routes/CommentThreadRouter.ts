/**
 * Api routes relating to comment threads
 */

import express, {Request, Response} from 'express';
import {threadState} from "../../../enums/threadStateEnum";
import {ThreadDB} from "../database/ThreadDB";
import {SnippetDB} from "../database/SnippetDB";

import {CommentThread} from "../../../models/api/CommentThread";
import {Comment} from "../../../models/api/Comment"
import {capture} from "../helpers/ErrorHelper";
import {FileDB} from "../database/FileDB";
import {CommentDB} from "../database/CommentDB";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {getClient, pgDB} from "../database/HelperDB";
import * as pg from "pg";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {userRouter} from "./UserRouter";

export const commentThreadRouter = express.Router();
commentThreadRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * Get a specific comment thread.
 */
commentThreadRouter.get('/:commentThreadID', capture(async (request: Request, response : Response) => {
    const commentThreadID : string = request.params.commentThreadID;
    const thread : CommentThread = await ThreadDB.addCommentSingle(ThreadDB.getThreadByID(commentThreadID));
    response.status(200).send(thread);
}));

/**
 * Get comment threads of a file
 */
commentThreadRouter.get('/file/:fileID', capture(async (request: Request, response : Response) => {
    const fileID = request.params.fileID;
    const commentThreads : CommentThread[] = await ThreadDB.addComments(ThreadDB.getThreadsByFile(fileID));
    // TODO user visibility for automated comments
    response.status(200).send(commentThreads);
}));

/**
 * Get comment threads of a submission (general project comments)
 */
commentThreadRouter.get('/submission/:submissionID', capture(async (request: Request, response: Response) => {
    const submissionID: string = request.params.submissionID;
    const nullFileID : string = await FileDB.getNullFileID(submissionID) as unknown as string;
    const commentThreads : CommentThread[] = await ThreadDB.addComments(ThreadDB.getThreadsByFile(nullFileID));
    // TODO user visibility here for automated comments
    response.status(200).send(commentThreads);
}));

/**
 * Get recent comment threads of project (limited)
 */
commentThreadRouter.get('/submission/:submissionID/recent', capture(async (request: Request, response: Response) => {
    const submissionID = request.params.submissionID;
    const limit : number | undefined = request.headers.limit as unknown as number;
    const commentThreads : CommentThread[] = await ThreadDB.addComments(ThreadDB.getThreadsBySubmission(submissionID, {limit : limit}));
    // TODO user visibility for automated comments
    response.status(200).send(commentThreads);
}));

/** ---------- POST REQUESTS ---------- */

/**
 * Create a comment thread
 * @param snippetID, ID of the snippet
 * @param fileID, ID of the file
 * @param submissionID, ID of the submission
 * @param request, request from the user
 * @param client, database client for transaction
 */
async function createCommentThread(snippetID : string | undefined, fileID : string | undefined, submissionID : string | undefined, request : Request, client : pgDB) {
    const commentThread : CommentThread = await ThreadDB.addThread({
        submissionID : submissionID,
        fileID : fileID,
        snippetID : snippetID,
        visibilityState : request.body.visiblityState ? request.body.visibilityState : threadState.public,
        client : client
    });

    // Comment creation
    const commentBody : string = request.body.commentBody;
    const userID : string = await getCurrentUserID(request);

    await CommentDB.addComment({
        commentThreadID : commentThread.ID,
        userID : userID,
        body : commentBody,
        client : client
    });

    return commentThread;
}

/**
 * Create comment thread on a submission. General comment thread.
 */
commentThreadRouter.post('/submission/:submissionID', capture( async(request : Request, response : Response) => {
    const client : pgDB = await getClient();
    let commentThreadID : string | undefined;

    try {
        await client.query('BEGIN');

        // Snippet creation
        const snippetID : string | undefined = await SnippetDB.createNullSnippet({client : client});

        // Thread creation
        const submissionID : string = request.params.submissionID;
        const fileID : string = await FileDB.getNullFileID(submissionID, {client : client}) as unknown as string;
        const commentThread : CommentThread = await createCommentThread(snippetID, fileID, submissionID, request, client);
        commentThreadID = commentThread.ID;

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

    if (commentThreadID == undefined) {
        response.status(500).send({
            error : 'db',
            message : 'Could not add the comment thread.'
        })
    } else {
        const result : CommentThread = await ThreadDB.addCommentSingle(ThreadDB.getThreadByID(commentThreadID));
        response.status(200).send(result);
    }
}));


/**
 * Create comment thread on a file.
 */
commentThreadRouter.post('/file/:fileID', capture(async (request : Request, response : Response) => {
    const client : pgDB = await getClient();
    let commentThreadID : string | undefined;

    try {
        await client.query('BEGIN');

        // Snippet creation
        let snippetID : string | undefined;
        if (request.body.snippetBody == undefined) {
            snippetID = await SnippetDB.createNullSnippet({client : client});
        } else {
            snippetID = await SnippetDB.addSnippet({
                lineStart : request.body.lineStart,
                charStart : request.body.charStart,
                lineEnd : request.body.lineEnd,
                charEnd : request.body.charEnd,
                body : request.body.snippetBody,
                client : client
            });
        }

        // Thread creation
        const submissionID : string = request.body.submissionID;
        const fileID : string = request.params.fileID;
        const commentThread : CommentThread = await createCommentThread(snippetID, fileID, submissionID, request, client);
        commentThreadID = commentThread.ID;

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

    if (commentThreadID == undefined) {
        response.status(500).send({
            error : 'db',
            message : 'Could not add the comment thread.'
        })
    } else {
        const result : CommentThread = await ThreadDB.addCommentSingle(ThreadDB.getThreadByID(commentThreadID));
        response.status(200).send(result);
    }
}));


