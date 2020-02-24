/**
 * Api routes relating to comment threads
 */

import express, { Response, Request } from 'express';
import {threadState} from "../../../enums/threadStateEnum";
import {ThreadDB} from "../database/ThreadDB";
import {Thread} from "../../../models/Thread";
import {SnippetDB} from "../database/SnippetDB";
import {Snippet} from "../../../models/Snippet";
import {CommentDB} from "../database/CommentDB";

export const commentThreadRouter = express.Router();

/**
 * Get a specific comment thread.
 */
commentThreadRouter.get('/:commentThreadID',
    (request: Request, result : Response) => {
        const commentThreadID : string = request.params.commentThreadID;

        ThreadDB.getThreadByID(commentThreadID)
            .then((thread : Thread) => {
                result.send(thread);
            })
            .catch((error : any) => {
                result.status(500).send({ error : error });
            })
    });

/**
 * Create comment thread on a submission. General comment thread.
 */
commentThreadRouter.post('/submission/:submissionID',
    (request : Request, result : Response) => {
        const submissionID : string = request.params.submissionID;
        const visibilityState : threadState = request.params.visibilityState as threadState;

        ThreadDB.addThread({submissionID : submissionID, visibilityState : visibilityState})
            .then((data : Thread) => {
                result.send(data);
            })
            .catch((error : any) => result.status(500).send({error : error}));
});

/**
 * Create comment thread on a file.
 */
commentThreadRouter.post('/file/:fileID',
    async (request : Request, result : Response) => {
        try {
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

            // Create snippet
            const snippet : Snippet = await SnippetDB.addSnippet({
                fileID : fileID,
                lineStart : lineStart,
                lineEnd : lineEnd,
                charStart : charStart,
                charEnd : charEnd
            });
            const snippetID = snippet.snippetID;

            console.log(`snippetID:${snippetID}`);

            // Create thread
            const commentThread = await ThreadDB.addThread({
                submissionID : submissionID,
                fileID : fileID,
                snippetID : snippetID,
                visibilityState : 'public' as threadState
            });

            console.log(`commentThreadID: ${commentThread.commentThreadID}`);
            // Add comment
            // TODO token for userID
            const comment = CommentDB.addComment({
                commentThreadID : commentThread.commentThreadID,
                userID : "00000000-0000-0000-0000-000000000000",
                body : body
            });

            // TODO send back ExtendThread[]
            result.send(ThreadDB.getThreadsByFile(fileID));
        } catch (error) {
            result.status(500).send({error:error})
        }

    });

