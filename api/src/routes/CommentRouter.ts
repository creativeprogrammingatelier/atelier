import express from "express";

import {Comment} from "../../../models/api/Comment";

import {removePermissionsComment, removePermissions} from "../helpers/APIFilterHelper";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {createMentions} from "../helpers/MentionsHelper";
import {PermissionError, requireRegisteredCommentThreadID, requireRegistered, requirePermission} from "../helpers/PermissionHelper";

import {CommentDB} from "../database/CommentDB";
import {transaction} from "../database/HelperDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {createTags} from "../helpers/TagsHelper";
import { getCommonQueryParams } from "../helpers/ParamsHelper";
import { PermissionEnum } from "../../../models/enums/PermissionEnum";

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
	const comments = (await CommentDB.filterComment({userID}))
		.map(comment => removePermissionsComment(comment));
	response.status(200).send(comments);
}));

/**
 * Get all comments by a user within a course
 */
commentRouter.get("/course/:courseID/user/:userID", capture(async(request, response) => {
	const courseID = request.params.courseID;
	const userID = request.params.userID;
	const comments = (await CommentDB.filterComment({courseID, userID}))
		.map(comment => removePermissionsComment(comment));
	response.status(200).send(comments);
}));

/** Get all comments on submissions by the current user */
commentRouter.get("/mysubmissions", capture(async (request, response) => {
    const params = getCommonQueryParams(request);
    const userID = await getCurrentUserID(request);
    const comments = (await CommentDB.getCommentsBySubmissionOwner(userID, undefined, params))
        .map(removePermissionsComment);
    response.status(200).send(comments);
}));

/** Get all comments on submissions by the current user inside a course */
commentRouter.get("/course/:courseID/mysubmissions", capture(async (request, response) => {
    const params = getCommonQueryParams(request);
    const userID = await getCurrentUserID(request);
    const courseID = request.params.courseID;
    const comments = (await CommentDB.getCommentsBySubmissionOwner(userID, courseID, params))
        .map(removePermissionsComment);
    response.status(200).send(comments);
}));

/** Get all comments for threads the current user participates in */
commentRouter.get("/participated", capture(async (request, response) => {
    const params = getCommonQueryParams(request);
    const userID = await getCurrentUserID(request);
    const comments = (await CommentDB.getCommentsByThreadParticipation(userID, undefined, params))
        .map(removePermissionsComment);
    response.status(200).send(comments);
}));

/** Get all comments for threads the current user participates in */
commentRouter.get("/course/:courseID/participated", capture(async (request, response) => {
    const params = getCommonQueryParams(request);
    const userID = await getCurrentUserID(request);
    const courseID = request.params.courseID;
    const comments = (await CommentDB.getCommentsByThreadParticipation(userID, courseID, params))
        .map(removePermissionsComment);
    response.status(200).send(comments);
}));

/** Get all comments in a course */
commentRouter.get("/course/:courseID", capture(async (request, response) => {
    const currentUserID = await getCurrentUserID(request);
    const params = getCommonQueryParams(request);
    const courseID = request.params.courseID;

    await requireRegistered(currentUserID, courseID);
    await requirePermission(currentUserID, PermissionEnum.viewAllSubmissions, courseID);

    const comments = (await CommentDB.filterComment({ courseID, ...params }))
        .map(removePermissionsComment);
    response.status(200).send(comments);
}))

// ---------- PUT REQUESTS ----------

/**
 * Add a comment to a comment thread
 * - body:
 *  - commentBody: comment made by the user
 * - requirements:
 *  - user is registered in the course of the commentThread
 */
commentRouter.put("/:commentThreadID", capture(async(request, response) => {
	const commentThreadID = request.params.commentThreadID;
	const currentUserID: string = await getCurrentUserID(request);
	const commentBody = request.body.comment;

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