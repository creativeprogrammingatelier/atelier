/**
 * Api routes relating to comment threads
 */

import express, { Response, Request } from 'express';
import {threadState} from "../../../enums/threadStateEnum";
import ThreadHelper from "../database/ThreadHelper";
import {Thread} from "../../../models/Thread";

export const commentThreadRouter = express.Router();

commentThreadRouter.post('/',
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