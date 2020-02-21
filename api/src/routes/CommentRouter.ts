/**
 * Api routes relating to comments
 */

import express, { Response, Request } from 'express';
import {CommentDB} from "../database/CommentDB";

export const commentRouter = express.Router();

commentRouter.put('/:commentThreadID',
    (request : Request, result : Response) => {
        const commentThreadID = request.params.commentThreadID;
        // TODO userID from token
        const userID = "00000000-0000-0000-0000-000000000000"; // TODO get userID from somehwere?
        const body = request.params.body;

        CommentDB.addComment({
            commentThreadID : commentThreadID,
            userID : userID,
            body : body
        })
            .then((data : any) => {
                result.send(data);
            })
            .catch((error : any) => result.status(500).send({error : error}));
});