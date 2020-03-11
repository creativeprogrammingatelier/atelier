/**
 * Api routes relating to comments
 */

import express, { Response, Request } from 'express';
import {CommentDB} from "../database/CommentDB";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {Comment} from "../../../models/api/Comment";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {userRouter} from "./UserRouter";

export const commentRouter = express.Router();
commentRouter.use(AuthMiddleware.requireAuth);

/**
 * Get all comments by a user
 */
commentRouter.get("/user/:userID", capture(async(request: Request, response: Response) => {
    const userID = request.params.userID;
    const comments = await CommentDB.filterComment({userID});
    response.status(200).send(comments);
    // TODO: Error handling
}));

/**
 * Get all comments by a user within a course
 */
commentRouter.get("/course/:courseID/user/:userID", capture(async(request: Request, response: Response) => {
    const courseID = request.params.courseID;
    const userID = request.params.userID;
    const comments = await CommentDB.filterComment({userID}); // TODO: Allow for filtering by courseID
    response.status(200).send(comments);
    // TODO: Error handling
}));

/** ---------- PUT REQUESTS ---------- */

/**
 * Add a comment to a comment thread
 */
commentRouter.put('/:commentThreadID',capture(async(request : Request, response : Response) => {
        const commentThreadID = request.params.commentThreadID;
        const userID : string = await getCurrentUserID(request);
        const commentBody = request.body.commentBody;
        const comment : Comment = await CommentDB.addComment({
            commentThreadID : commentThreadID,
            userID : userID,
            body : commentBody
        });
        response.status(200).send(comment);
}));