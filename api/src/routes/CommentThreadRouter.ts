/**
 * Api routes relating to comment threads
 */

import express, { Response, Request } from 'express';
import {threadState} from "../../../enums/threadStateEnum";
import {ThreadDB} from "../database/ThreadDB";
import {ExtendedThread, Thread} from "../../../models/database/Thread";
import {SnippetDB} from "../database/SnippetDB";
import {Snippet} from "../../../models/database/Snippet";
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

commentThreadRouter.get('/file/:fileID',
    async (request: Request, result : Response) => {
        try {
            const fileID = request.params.fileID;

            // Threads and comments
            const extendedThreads : ExtendedThread[] = await ThreadDB.addComments(ThreadDB.getThreadsByFile(fileID));
            const snippets : Snippet[] = await SnippetDB.getSnippetsByFile(fileID);

            let snippetMap = new Map();
            snippets.forEach((snippet : Snippet) => {
                snippetMap.set(snippet.snippetID, snippet);
            });

            const extendedThreadSnippet = extendedThreads.map((extendedThread : ExtendedThread) => {
                const snippetID : string | undefined = extendedThread.snippetID;
                const snippet : Snippet = snippetMap.get(snippetID) == undefined ? "" : snippetMap.get(snippetID);
                return {
                    ...extendedThread,
                    snippet : snippet
                }
            });

            result.send(extendedThreadSnippet);
        } catch (error) {
            result.status(500).send({error:error});
        }
    }
);

commentThreadRouter.get('/submission/:submissionID',
    async (request: Request, result: Response) => {
        const submissionID = request.params.submissoinID;

        try {
            let extendedThreads : ExtendedThread[] = await ThreadDB.addComments(ThreadDB.getThreadsBySubmission(submissionID));
            extendedThreads = extendedThreads.filter((extendedThread : ExtendedThread) => {
               return extendedThread.fileID == undefined;
            });
            result.send(extendedThreads);
        } catch (error) {
            result.status(500).send({error:error});
        }
    }
);

commentThreadRouter.get('/submission/:submissionID/recent', async (request: Request, response: Response) => {
    const submissionID = request.params.submissionID;
    const limit = request.params.limit;
    const offset = request.params.offset;

    // TODO: Wait for backend support

    try {
        const commentThreads: ExtendedThread[] = await ThreadDB.addComments(ThreadDB.getThreadsBySubmission(submissionID));
        response.send(commentThreads);
    } catch (error) {
        response.status(500).send({error:"internal", message:"Could not retrieve recent comments", details:error});
    }
});
