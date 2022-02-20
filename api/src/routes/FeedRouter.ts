import express from "express";

import {removePermissionsMention, removePermissionsCommentThread, removePermissionsComment, removePermissionsSubmission, filterCommentThread, filterComments} from "../helpers/APIFilterHelper";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {getCommonQueryParams} from "../helpers/ParamsHelper";

import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {map, DBTools} from "../database/HelperDB";
import {requireRegistered, requirePermission} from "../helpers/PermissionHelper";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";
import {FeedItem} from "../../../models/api/FeedItem";

import {MentionsDB} from "../database/MentionsDB";
import {SubmissionDB} from "../database/SubmissionDB";
import {ThreadDB} from "../database/ThreadDB";
import {CommentDB} from "../database/CommentDB";
import {assertNever} from "../../../helpers/Never";

export const feedRouter = express.Router();
feedRouter.use(AuthMiddleware.requireAuth);

async function getPersonalFeed(userID: string, params: DBTools, courseID?: string) {
    const data: FeedItem[][] = await Promise.all([
        SubmissionDB.getRecents({userID, courseID, ...params})
            .then(map(removePermissionsSubmission))
            .then(map(submission => ({type: ("submission" as const), data: submission, timestamp: submission.date, ID: submission.ID}))),
        MentionsDB.getMentionsByUser(userID, courseID, params)
            .then(map(removePermissionsMention))
            .then(map(mention => ({type: ("mention" as const), data: mention, timestamp: mention.comment.created, ID: mention.ID}))),
        ThreadDB.getThreadsBySubmissionOwner(userID, courseID, true, true, params)
            .then(async threads => filterCommentThread(threads, userID))
            .then(map(removePermissionsCommentThread))
            .then(map(thread => ({type: ("commentThread" as const), data: thread, relation: ("yourSubmission" as const), timestamp: thread.comments[0]?.created || "", ID: thread.ID}))),
        CommentDB.getCommentsBySubmissionOwner(userID, courseID, true, params)
            .then(async comments => filterComments(comments, userID))
            .then(map(removePermissionsComment))
            .then(map(comment => ({type: ("comment" as const), data: comment, relation: ("yourSubmission" as const), timestamp: comment.created, ID: comment.ID}))),
        CommentDB.getCommentsByThreadParticipation(userID, courseID, true, params)
            .then(async comments => filterComments(comments, userID))
            .then(map(removePermissionsComment))
            .then(map(comment => ({type: ("comment" as const), data: comment, relation: ("participated" as const), timestamp: comment.created, ID: comment.ID})))
    ]);
    const byCommentId = ([] as FeedItem[]).concat(...data)
        // Group all items related to a single comment together, so we'll only show one of them in the feed
        .reduce((acc, next) => {
            let commentID = "";
            switch (next.type) {
            case "submission":
                // A submission is not equivalent to a comment, so group it by its own ID
                commentID = next.ID;
                break;
            case "comment":
                commentID = next.ID;
                break;
            case "commentThread":
                commentID = next.data.comments[0]?.ID || next.data.ID;
                break;
            case "mention":
                commentID = next.data.comment?.ID || next.data.ID;
                break;
            default:
                assertNever(next);
            }
            if (commentID in acc) {
                acc[commentID].push(next);
            } else {
                acc[commentID] = [next];
            }
            return acc;
        }, {} as { [ID: string]: FeedItem[] });
    return Object.values(byCommentId)
        // For each commentId, we want to only show one item, so first take the submission if there is one,
        // then take the mention, if there's none take the thread and else take the comment
        .map(arr =>
            arr.find(f => f.type === "submission")
            || arr.find(f => f.type === "mention")
            || arr.find(f => f.type === "commentThread")
            || arr.find(f => f.type === "comment"))
        // Filter out the undefined ones (there shouldn't be any by construction, but this makes TS happy)
        .filter((x): x is FeedItem => x !== undefined)
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
            .then(map(submission => ({type: ("submission" as const), data: submission, timestamp: submission.date, ID: submission.ID}))),
        ThreadDB.filterThread({courseID, addComments: true, automatedOnlyIfShared: true, ...params})
            .then(async threads => filterCommentThread(threads, userID))
            .then(map(removePermissionsCommentThread))
            .then(map(thread => ({type: ("commentThread" as const), data: thread, timestamp: thread.comments[0]?.created || "", ID: thread.ID}))),
        CommentDB.filterComment({courseID, onlyReplies: true, ...params})
            .then(async comments => filterComments(comments, userID))
            .then(map(removePermissionsComment))
            .then(map(comment => ({type: ("comment" as const), data: comment, timestamp: comment.created, ID: comment.ID})))
    ]);
    const sortedData = ([] as FeedItem[]).concat(...data)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    response.send(sortedData);
}));
