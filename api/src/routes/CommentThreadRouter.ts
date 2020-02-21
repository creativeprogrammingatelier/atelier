/**
 * Api routes relating to comment threads
 */

import express, { Response, Request } from 'express';
import {threadState} from "../../../enums/threadStateEnum";
import ThreadHelper from "../database/ThreadHelper";
import {Thread} from "../../../models/Thread";
import SubmissionHelper from "../database/SubmissionHelper";
import FileHelper from "../database/FileHelper";
import {submissionsRouter} from "./SubmissionsRouter";

export const commentThreadRouter = express.Router();

/**
 * Get a specific comment thread.
 */
commentThreadRouter.get('/:commentThreadID',
    (request: Request, result : Response) => {
        const commentThreadID : string = request.params.commentThreadID;

        ThreadHelper.getThreadByID(commentThreadID)
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

        ThreadHelper.addThread({submissionID : submissionID, visibilityState : visibilityState})
            .then((data : Thread) => {
                result.send(data);
            })
            .catch((error : any) => result.status(500).send({error : error}));
});

/**
 * Create comment thread on a file.
 */
commentThreadRouter.post('/file/:fileID',
    (request : Request, result : Response) => {
        const submissionID : string = request.params.submissionID;
        const fileID : string = request.params.fileID;
        const snippetID : string = request.params.snippetID;
        const visibilityState : threadState = request.params.visibilityState as threadState;

        ThreadHelper.addThread({submissionID : submissionID, fileID : fileID, snippetID : snippetID, visibilityState : visibilityState})
            .then((data : Thread) => {
                result.send(data);
            })
            .catch((error : any) => result.status(500).send({error : error}));
    });

