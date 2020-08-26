import express from "express";

import {removePermissionsMention, removePermissionsCommentThread, removePermissionsComment, removePermissionsSubmission, filterCommentThread} from "../helpers/APIFilterHelper";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {getCommonQueryParams} from "../helpers/ParamsHelper";

import {AuthMiddleware} from "../middleware/AuthMiddleware";
import { map, DBTools } from "../database/HelperDB";
import { requireRegistered, requirePermission } from "../helpers/PermissionHelper";
import { PermissionEnum } from "../../../models/enums/PermissionEnum";
import { FeedItem } from "../../../models/api/FeedItem";

import {MentionsDB} from "../database/MentionsDB";
import { SubmissionDB } from "../database/SubmissionDB";
import { ThreadDB } from "../database/ThreadDB";
import { CommentDB } from "../database/CommentDB";

export const feedRouter = express.Router();
feedRouter.use(AuthMiddleware.requireAuth);

async function getPersonalFeed(userID: string, params: DBTools, courseID?: string) {
    const data: FeedItem[][] = await Promise.all([
        SubmissionDB.getRecents({ userID, courseID, ...params })
            .then(map(removePermissionsSubmission))
            .then(map(submission => ({ type: "submission", data: submission, timestamp: submission.date, ID: submission.ID }))),
        MentionsDB.getMentionsByUser(userID, courseID, params)
            .then(map(removePermissionsMention))
            .then(map(mention => ({ type: "mention", data: mention, timestamp: mention.comment.created, ID: mention.ID }))),
        ThreadDB.getThreadsBySubmissionOwner(userID, courseID, true, true, params)
            .then(threads => filterCommentThread(threads, userID))
            .then(map(removePermissionsCommentThread))
            .then(map(thread => ({ type: "commentThread", data: thread, timestamp: thread.comments[0].created, ID: thread.ID }))),
        // TODO: Handle visibility of comments (also in comments api?)
        // CommentDB.getCommentsBySubmissionOwner(userID, courseID, params)
        //     .then(map(removePermissionsComment))
        //     .then(map(comment => ({ type: "comment", data: comment, timestamp: comment.created }))),
        // CommentDB.getCommentsByThreadParticipation(userID, courseID, params)
        //     .then(map(removePermissionsComment))
        //     .then(map(comment => ({ type: "comment", data: comment, timestamp: comment.created })))
    ]);
    return ([] as FeedItem[]).concat(...data)
        // Sort by date descending
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

feedRouter.get("/personal", capture(async (request, response) => {
	const params = getCommonQueryParams(request);
    const userID = await getCurrentUserID(request);
	const feedData = await getPersonalFeed(userID, params);
	response.send(feedData);
}));

feedRouter.get("/course/:courseID/personal", capture(async (request, response) => {
    const params = getCommonQueryParams(request);
    const userID = await getCurrentUserID(request);
    const courseID = request.params.courseID;

    await requireRegistered(userID, courseID);

	const feedData = await getPersonalFeed(userID, params, courseID);
	response.send(feedData);
}));

feedRouter.get("/course/:courseID", capture(async (request, response) => {
	const params = getCommonQueryParams(request);
	const userID = await getCurrentUserID(request);
	const courseID = request.params.courseID;
    
    await requireRegistered(userID, courseID);
    await requirePermission(userID, PermissionEnum.viewAllSubmissions, courseID);

    const data: FeedItem[][] = await Promise.all([
        SubmissionDB.getSubmissionsByCourse(courseID, params)
            .then(map(removePermissionsSubmission))
            .then(map(submission => ({ type: "submission", data: submission, timestamp: submission.date, ID: submission.ID }))),
        ThreadDB.filterThread({ courseID, addComments: true, automatedOnlyIfShared: true, ...params })
            .then(threads => filterCommentThread(threads, userID))
            .then(map(removePermissionsCommentThread))
            .then(map(thread => ({ type: "commentThread", data: thread, timestamp: thread.comments[0]?.created || "", ID: thread.ID }))),
        // TODO: Handle visibility of comments
        // CommentDB.filterComment({ courseID, ...params })
        //     .then(map(removePermissionsComment))
        //     .then(map(comment => ({ type: "comment", data: comment, timestamp: comment.created })))
    ]);
    const sortedData = ([] as FeedItem[]).concat(...data)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    response.send(sortedData);
}));
