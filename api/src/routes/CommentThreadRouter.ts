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

export const commentThreadRouter = express.Router();

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
    //const commentThreads : CommentThread[] = await ThreadDB.getThreadsByFile(fileID);
    response.status(200).send(commentThreads);
}));

/**
 * Get comment threads of a submission (general project comments)
 */
commentThreadRouter.get('/submission/:submissionID', capture(async (request: Request, response: Response) => {
    const submissionID: string = request.params.submissionID;
    const nullFileID : string = await FileDB.getNullFileID(submissionID) as unknown as string;
    const commentThreads : CommentThread[] = await ThreadDB.addComments(ThreadDB.getThreadsByFile(nullFileID));
    response.status(200).send(commentThreads);
}));

/**
 * Get recent comment threads of project (limited)
 */
commentThreadRouter.get('/submission/:submissionID/recent', capture(async (request: Request, response: Response) => {
    const submissionID = request.params.submissionID;
    const limit : number | undefined = request.headers.limit as unknown as number;
    const commentThreads : CommentThread[] = await ThreadDB.addComments(ThreadDB.getThreadsBySubmission(submissionID, {limit : limit}));
    response.status(200).send(commentThreads);
}));

/** ---------- POST REQUESTS ---------- */

/**
 * Create comment thread on a submission. General comment thread.
 */
commentThreadRouter.post('/submission/:submissionID', capture( async(request : Request, response : Response) => {
    //const client = await getClient();

    try {
        //await client.query('BEGIN');

        // Snippet creation
        const snippetID : string | undefined = await SnippetDB.createNullSnippet();

        // Thread creation
        const submissionID : string = request.params.submissionID;
        const fileID : string = FileDB.getNullFileID(submissionID) as unknown as string;

        console.log("Submission id: " + submissionID);
        console.log("Snippet id: " + snippetID);
        console.log("File id: " + fileID);

        const commentThread : CommentThread = await ThreadDB.addThread({
            submissionID : submissionID,
            fileID : fileID,
            snippetID : snippetID,
            visibilityState : threadState.public,
        });

        // Comment creation
        const commentBody : string = request.body.commentBody;
        const userID : string = await getCurrentUserID(request);

        console.log("commentThread id: " + commentThread.ID);
        console.log("User id: " + userID);
        console.log("Comment body: " + commentBody);

        const comment : Comment = await CommentDB.addComment({
            commentThreadID : commentThread.ID,
            userID : userID,
            body : commentBody,
        });

        const result : CommentThread = await ThreadDB.addCommentSingle(ThreadDB.getThreadByID(commentThread.ID));
        response.status(200).send(result);

    } catch (e) {
        // await client.query('ROLLBACK');
        response.status(500).send({});
        throw e;
    } finally {
        // client.release();

    }
}));

// TODO when client fixed, write function that takes snippetID, fileID, request, client to create commentThread / comment

/**
 * Create comment thread on a file.
 */
commentThreadRouter.post('/file/:fileID', capture(async (request : Request, response : Response) => {
    //const client = await getClient();

    try {
        //await client.query('BEGIN');

        // Snippet creation
        let snippetID : string | undefined;

        const snippetBody : string | undefined = request.body.snippetBody;
        const lineStart : number | undefined = request.body.lineStart;
        const charStart : number | undefined = request.body.charStart;
        const lineEnd : number | undefined = request.body.lineEnd;
        const charEnd : number | undefined = request.body.charEnd;

        console.log("Snippet body: " + snippetBody);
        console.log("Line start: " + lineStart);
        console.log("Char start: " + charStart);
        console.log("Line end: " + lineEnd);
        console.log("Char end: " + charEnd);


        // If property is missing, the comment becomes a general comment with empty snippet
        if (snippetBody == undefined || lineStart == undefined || charStart == undefined || lineEnd == undefined || charEnd == undefined) {
            console.log("Creating a NULL snippet");
            snippetID = await SnippetDB.createNullSnippet();
        } else {
            console.log("Creating body snippet");
            snippetID = await SnippetDB.addSnippet({
                lineStart : lineStart,
                charStart : charStart,
                lineEnd : lineEnd,
                charEnd : charEnd,
                body : snippetBody
            });
        }

        // Thread creation
        const submissionID : string = request.body.submissionID;
        const fileID : string = request.params.fileID;

        console.log("Submission id: " + submissionID);
        console.log("File id: " + fileID);
        console.log("Snippet id: " + snippetID);

        const commentThread : CommentThread = await ThreadDB.addThread({
            submissionID : submissionID,
            fileID : fileID,
            snippetID : snippetID,
            visibilityState : threadState.public,
        });

        // Comment creation
        const commentBody : string = request.body.commentBody;
        const userID : string = await getCurrentUserID(request);

        console.log("commentThread id: " + commentThread.ID);
        console.log("User id: " + userID);
        console.log("Comment body: " + commentBody);

        const comment : Comment = await CommentDB.addComment({
            commentThreadID : commentThread.ID,
            userID : userID,
            body : commentBody,
        });

        const result : CommentThread = await ThreadDB.addCommentSingle(ThreadDB.getThreadByID(commentThread.ID));
        response.status(200).send(result);

    } catch (e) {
        // await client.query('ROLLBACK');
        response.status(500).send({});
        throw e;
    } finally {
        // client.release();

    }
}));


