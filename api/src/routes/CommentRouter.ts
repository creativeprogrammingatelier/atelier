import express from "express";

import {Comment} from "../../../models/api/Comment";

import {removePermissionsComment, filterComments} from "../helpers/APIFilterHelper";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {createMentions} from "../helpers/MentionsHelper";
import {PermissionError, requireRegisteredCommentThreadID, requireRegistered, requirePermission} from "../helpers/PermissionHelper";

import {CommentDB} from "../database/CommentDB";
import {transaction} from "../database/HelperDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {createTags} from "../helpers/TagsHelper";
import {getCommonQueryParams} from "../helpers/ParamsHelper";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";
import {RequestB} from "../helpers/RequestHelper";

/**
 * Api routes relating to comments
 */

export const commentRouter = express.Router();
commentRouter.use(AuthMiddleware.requireAuth);

// ---------- GET REQUESTS ----------

/**
 * Get all comments by a user
 */
commentRouter.get("/user/:userID", capture(async(request, response) => {
    const userID = request.params.userID;
    const comments = (await CommentDB.filterComment({userID})
        .then(async comments => filterComments(comments, userID)))
        .map(comment => removePermissionsComment(comment));
    response.status(200).send(comments);
}));

/**
 * Get all comments by a user within a course
 */
commentRouter.get("/course/:courseID/user/:userID", capture(async(request, response) => {
    const courseID = request.params.courseID;
    const userID = request.params.userID;
    const comments = (await CommentDB.filterComment({courseID, userID})
        .then(async comments => filterComments(comments, userID)))
        .map(comment => removePermissionsComment(comment));
    response.status(200).send(comments);
}));

/** Get all comments in a course */
commentRouter.get("/course/:courseID", capture(async (request, response) => {
    const currentUserID = await getCurrentUserID(request);
    const params = getCommonQueryParams(request);
    const courseID = request.params.courseID;

    await requireRegistered(currentUserID, courseID);
    await requirePermission(currentUserID, PermissionEnum.viewAllSubmissions, courseID);

    const comments = (await CommentDB.filterComment({courseID, ...params})
        .then(async comments => filterComments(comments, currentUserID)))
        .map(removePermissionsComment);
    response.status(200).send(comments);
}));

// ---------- PUT REQUESTS ----------

/**
 * Add a comment to a comment thread
 * - body:
 *  - commentBody: comment made by the user
 * - requirements:
 *  - user is registered in the course of the commentThread
 */
commentRouter.put("/:commentThreadID", capture(async(request: RequestB<{ comment: string }>, response) => {
    const commentThreadID = request.params.commentThreadID;
    const currentUserID: string = await getCurrentUserID(request);
    let commentBody: string = request.body.comment;

    // Trim comment
    commentBody = commentBody.trim();

    // User should be registered
    await requireRegisteredCommentThreadID(currentUserID, commentThreadID);

    const comment = await transaction(async client => {
        const comment: Comment = await CommentDB.addComment({
            commentThreadID,
            userID: currentUserID,
            body: commentBody,
            client
        });

        await createMentions(commentBody, comment.ID, comment.references.courseID, currentUserID, client);
        await createTags(commentBody, comment.ID, client);

        return comment;
    });

    response.status(200).send(comment);
}));

// ---------- DELETE REQUESTS ----------

/**
 * Delete a comment from a comment thread
 * - requirements:
 *  - User is the author of the comment
 */
commentRouter.delete("/:commentThreadID/:commentID", capture(async(request, response) => {
    const currentUserID = await getCurrentUserID(request);
    const commentID = request.params.commentID;
    //const commentThreadID = request.params.commentThreadID;

    let comment = await CommentDB.getCommentByID(commentID);
    if (comment.user.ID !== currentUserID) {
        throw new PermissionError("permission.notAllowed", "You should be the owner of the comment.");
    }

    comment = await CommentDB.updateComment({
        commentID,
        body: "This comment was deleted"
    });

    response.status(200).send(comment);
}));
