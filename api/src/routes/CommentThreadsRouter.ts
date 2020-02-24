/**
 * Api routes relating to comment threads
 */

import express, { Response, Request } from 'express';
import {ThreadDB} from "../database/ThreadDB";
import {ExtendedThread} from "../../../models/database/Thread";
import {SnippetDB} from "../database/SnippetDB";
import {Snippet} from "../../../models/database/Snippet";

export const commentThreadsRouter = express.Router();

commentThreadsRouter.get('/submission/:submissionID',
    (request: Request, result: Response) => {
        const submissionID = request.params.submissoinID;

        ThreadDB.getThreadsBySubmission(submissionID)
            .then((commentThreads : any) => result.send(commentThreads))
            .catch((error : any) => result.status(500).send({error: error}));
    }
);

// Get comment threads for the file
// ThreadHelper.getThreadsbyFile

// Get comments for threads
// CommentHelper.getCommentByThread

commentThreadsRouter.get('/file/:fileID',
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

commentThreadsRouter.get('/user/:userID',
    (request : Request, result : Response) => {
        const userID = request.params.userID;

        // TODO no database support yet
    }
);