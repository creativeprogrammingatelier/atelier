/**
 * Api routes relating to comment threads
 */

import express, { Response, Request } from 'express';
import ThreadHelper from "../database/ThreadHelper";

export const commentThreadsRouter = express.Router();

commentThreadsRouter.get('/submission/:submissionID',
    (request: Request, result: Response) => {
        const submissionID = request.params.submissoinID;

        ThreadHelper.getThreadsBySubmission(submissionID)
            .then(commentThreads => result.send(commentThreads))
            .catch((error : any) => result.status(500).send({error: error}));
    }
);

// Get comment threads for the file
// ThreadHelper.getThreadsbyFile

// Get comments for threads
// CommentHelper.getCommentByThread

commentThreadsRouter.get('/file/:fileID',
    (request: Request, result : Response) => {
        const fileID = request.params.fileID;

        ThreadHelper.getThreadsByFile(fileID)
            .then(files => result.send(files))
            .catch(error => result.status(500).send({error: error}));
    }
);

commentThreadsRouter.get('/user/:userID',
    (request : Request, result : Response) => {
        const userID = request.params.userID;

        // TODO no database support yet
    }
);