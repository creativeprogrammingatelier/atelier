/**
 * Api routes relating to comments
 */

import express from 'express';
import {CommentDB} from "../database/CommentDB";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {Comment} from "../../../models/api/Comment";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {requireRegisteredCommentThreadID} from "../helpers/PermissionHelper";
import { getMentions } from '../helpers/MentionsHelper';
import { MentionsDB } from '../database/MentionsDB';
import { getClient } from '../database/HelperDB';

export const commentRouter = express.Router();
commentRouter.use(AuthMiddleware.requireAuth);

/**
 * Get all comments by a user
 */
commentRouter.get("/user/:userID", capture(async (request, response) => {
    const userID = request.params.userID;
    const comments = await CommentDB.filterComment({userID});
    response.status(200).send(comments);
}));

/**
 * Get all comments by a user within a course
 */
commentRouter.get("/course/:courseID/user/:userID", capture(async (request, response) => {
    const courseID = request.params.courseID;
    const userID = request.params.userID;
    const comments = await CommentDB.filterComment({courseID, userID});
    response.status(200).send(comments);
}));

/** ---------- PUT REQUESTS ---------- */

/**
 * Add a comment to a comment thread
 * - body:
 *  - commentBody: comment made by the user
 * - requirements:
 *  - user is registered in the course of the commentThread
 */
commentRouter.put('/:commentThreadID', capture(async (request, response) => {
        const commentThreadID = request.params.commentThreadID;
        const currentUserID : string = await getCurrentUserID(request);
        const commentBody = request.body.commentBody;

        // User should be registered
        await requireRegisteredCommentThreadID(currentUserID, commentThreadID);

        const client = await getClient();
        try {
            await client.query('BEGIN');

            const comment : Comment = await CommentDB.addComment({
                commentThreadID,
                userID : currentUserID,
                body : commentBody,
                client
            });
            
            const mentionedUsers = await getMentions(commentBody, comment.references.courseID, client);
            await Promise.all(mentionedUsers.map(user => 
                MentionsDB.addMention({ userID: user.ID, commentID: comment.ID, client })
            ));

            await client.query('COMMIT');
            response.status(200).send(comment);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
}));