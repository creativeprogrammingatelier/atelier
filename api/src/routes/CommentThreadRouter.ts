import express, {Request} from "express";

import {CommentThread, CreateCommentThread} from "../../../models/api/CommentThread";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";
import {ThreadState} from "../../../models/enums/ThreadStateEnum";

import {filterCommentThread, removePermissionsCommentThread} from "../helpers/APIFilterHelper";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {commentThreadOwner} from "../../../helpers/CommentThreadHelper";
import {capture} from "../helpers/ErrorHelper";
import {getFilePathOnDisk, readFileAsString} from "../helpers/FilesystemHelper";
import {createMentions} from "../helpers/MentionsHelper";
import {requirePermission, requireRegisteredCommentThreadID, requireRegisteredFileID, requireRegisteredSubmissionID, requireRegistered} from "../helpers/PermissionHelper";
import {getContextLines} from "../../../helpers/SnippetHelper";

import {CommentDB} from "../database/CommentDB";
import {FileDB} from "../database/FileDB";
import {pgDB, transaction} from "../database/HelperDB";
import {SnippetDB} from "../database/SnippetDB";
import {ThreadDB} from "../database/ThreadDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {createTags} from "../helpers/TagsHelper";
import { getCommonQueryParams } from "../helpers/ParamsHelper";
import { RequestB } from "../helpers/RequestHelper";

/**
 * Api routes relating to comment threads
 */

export const commentThreadRouter = express.Router();
commentThreadRouter.use(AuthMiddleware.requireAuth);

interface CreateRequestBody {
    visibility?: ThreadState,
    automated?: boolean,
    comment: string
}

/**
 * Create a comment thread
 * @param snippetID, ID of the snippet
 * @param fileID, ID of the file
 * @param submissionID, ID of the submission
 * @param request, request from the user
 * @param client, database client for transaction
 */
async function createCommentThread(
    request: RequestB<CreateRequestBody>,
    client: pgDB, snippetID?: string,
    fileID?: string, submissionID?: string
) {
    const commentThread: CommentThread = await ThreadDB.addThread({
        submissionID,
        fileID,
        snippetID,
        visibilityState: request.body.visibility ? request.body.visibility : ThreadState.public,
        automated: request.body.automated !== undefined ? request.body.automated : false,
        client
    });

    // Comment creation
    const commentBody: string = request.body.comment;
    const userID: string = await getCurrentUserID(request);

    const comment = await CommentDB.addComment({
        commentThreadID: commentThread.ID,
        userID,
        body: commentBody,
        client
    });

    await createMentions(commentBody, comment.ID, comment.references.courseID, userID, client);
    await createTags(commentBody, comment.ID, client);

    return {...commentThread, comments: commentThread.comments.concat(comment)};
}

// ---------- GET REQUESTS ----------

/** Get all comments on submissions by the current user */
commentThreadRouter.get("/mysubmissions", capture(async (request, response) => {
    const params = getCommonQueryParams(request);
    const userID = await getCurrentUserID(request);
    const threads = await ThreadDB.getThreadsBySubmissionOwner(userID, undefined, true, true, params)
        .then(async threads => filterCommentThread(threads, userID))
        .then(threads => threads.map(removePermissionsCommentThread));
    response.status(200).send(threads);
}));

/** Get all comments on submissions by the current user inside a course */
commentThreadRouter.get("/course/:courseID/mysubmissions", capture(async (request, response) => {
    const params = getCommonQueryParams(request);
    const userID = await getCurrentUserID(request);
    const courseID = request.params.courseID;
    const threads = await ThreadDB.getThreadsBySubmissionOwner(userID, courseID, true, true, params)
        .then(async threads => filterCommentThread(threads, userID))
        .then(threads => threads.map(removePermissionsCommentThread));
    response.status(200).send(threads);
}));

/** Get all commentthreads inside a course */
commentThreadRouter.get("/course/:courseID", capture(async (request, response) => {
    const currentUserID = await getCurrentUserID(request);
    const params = getCommonQueryParams(request);
    const courseID = request.params.courseID;

    await requireRegistered(currentUserID, courseID);
    await requirePermission(currentUserID, PermissionEnum.viewAllSubmissions, courseID);

    const threads = await ThreadDB.filterThread({ courseID, addComments: true, ...params })
        .then(async threads => filterCommentThread(threads, currentUserID))
        .then(threads => threads.map(removePermissionsCommentThread));
    response.status(200).send(threads);
}));

/**
 * Get a specific comment thread.
 * - requirements:
 *  - user is registered in the course of the commentThread
 */
commentThreadRouter.get("/:commentThreadID", capture(async (request, response) => {
    const commentThreadID: string = request.params.commentThreadID;
    const currentUserID: string = await getCurrentUserID(request);

    // User should be registered in the course
    await requireRegisteredCommentThreadID(currentUserID, commentThreadID);

    const thread: CommentThread = (await ThreadDB.addCommentSingle(ThreadDB.getThreadByID(commentThreadID)));
    response.status(200).send(removePermissionsCommentThread(thread));
}));

/**
 * Get comment threads of a file.
 * - requirements:
 *  - user is registered in the course of the commentThread
 * - notes:
 *  - requires permission to view private comment threads
 */
commentThreadRouter.get("/file/:fileID", capture(async (request, response) => {
    const fileID = request.params.fileID;
    const currentUserID: string = await getCurrentUserID(request);

    // User should be registered in the course
    await requireRegisteredFileID(currentUserID, fileID);

    // Retrieve comment threads, and filter out restricted comment threads if user does not have access
    let commentThreads: CommentThread[] = await ThreadDB.addComments(ThreadDB.getThreadsByFile(fileID));
    commentThreads = (await filterCommentThread(commentThreads, currentUserID))
        .map(thread => removePermissionsCommentThread(thread));
    response.status(200).send(commentThreads);
}));

/**
 * Get comment threads of a submission (general project comments).
 * - requirements:
 *  - user is registered in the course of the submission
 * - notes:
 *  - requires permission to view private comment threads
 */
commentThreadRouter.get("/submission/:submissionID", capture(async (request, response) => {
    const submissionID = request.params.submissionID;
    const nullFileID = await FileDB.getNullFileID(submissionID);
    const currentUserID = await getCurrentUserID(request);

    // User should be registered in the course
    await requireRegisteredSubmissionID(currentUserID, submissionID);

    // Retrieve comment threads, and filter out restricted comment threads if user does not have access
    let commentThreads: CommentThread[] = await ThreadDB.addComments(ThreadDB.getThreadsByFile(nullFileID));
    commentThreads = (await filterCommentThread(commentThreads, currentUserID))
        .map(thread => removePermissionsCommentThread(thread));
    response.status(200).send(commentThreads);
}));

/**
 * Get recent comment threads of project (limited)
 * - requirements:
 *  - user is registered in the course of the submission
 * - notes:
 *  - requires permission to view private comment threads
 */
commentThreadRouter.get("/submission/:submissionID/recent", capture(async (request, response) => {
    const submissionID = request.params.submissionID;
    const limit: number | undefined = request.headers.limit as unknown as number;
    const currentUserID: string = await getCurrentUserID(request);

    // User should be registered in the course
    await requireRegisteredSubmissionID(currentUserID, submissionID);

    // Retrieve comment threads, and filter out restricted comment threads if user does not have access
    let commentThreads = await ThreadDB.addComments(ThreadDB.getThreadsBySubmission(submissionID, {limit}));
    // Recent comment threads should not include submission comments
    commentThreads = commentThreads.filter((commentThread: CommentThread) => commentThread.snippet);
    commentThreads = (await filterCommentThread(commentThreads, currentUserID))
        .map(commentThread => removePermissionsCommentThread(commentThread));
    response.status(200).send(commentThreads);
}));

// ---------- PUT REQUESTS ----------

/**
 * Update comment thread state (visibility)
 * - requirements:
 *  - user is the owner of the comment thread (first comment)
 *  - user has permission to manage restricted comment threads
 */
commentThreadRouter.put("/:commentThreadID", capture(async (request: RequestB<{ visibility?: ThreadState }>, response) => {
    const commentThreadID: string = request.params.commentThreadID;
    const visibilityState: ThreadState | undefined = request.body.visibility as ThreadState;

    const oldCommentThread: CommentThread = await ThreadDB.addCommentSingle(ThreadDB.getThreadByID(commentThreadID));
    const courseID: string = oldCommentThread.references.courseID;
    const currentUserID: string = await getCurrentUserID(request);
    // Either use is owner of a comment thread or has permission to manage restricted comments
    if (commentThreadOwner(oldCommentThread) !== currentUserID) {
        await requirePermission(currentUserID, PermissionEnum.manageRestrictedComments, courseID);
    }

    const commentThread: CommentThread = await ThreadDB.updateThread({
        commentThreadID,
        visibilityState,
        sharedByID: visibilityState === ThreadState.public ? currentUserID : undefined
    });
    response.status(200).send(removePermissionsCommentThread(commentThread));
}));


// ---------- POST REQUESTS ----------

/**
 * Create comment thread on a submission. General comment thread.
 * - requirements:
 *  - user is registered in the course of the submission
 */
commentThreadRouter.post("/submission/:submissionID", capture(async (request, response) => {
    const currentUserID = await getCurrentUserID(request);
    const submissionID = request.params.submissionID;

    // User should be registered in the course
    await requireRegisteredSubmissionID(currentUserID, submissionID);

    const commentThread = await transaction(async client => {
        // Snippet creation
        const snippetID: string | undefined = await SnippetDB.createNullSnippet({client});

        // Thread creation
        const fileID: string = await FileDB.getNullFileID(submissionID, {client}) as unknown as string;
        return createCommentThread(request, client, snippetID, fileID, submissionID);
    });

    response.send(commentThread);
}));

/**
 * Create comment thread on a file.
 * - requirements:
 *  - user is registered in the course of the file
 */
commentThreadRouter.post("/file/:fileID", capture(async (request, response) => {
    const fileID = request.params.fileID;
    const currentUserID = await getCurrentUserID(request);
    const data = request.body as CreateCommentThread;

    // User should be registered in course
    await requireRegisteredFileID(currentUserID, fileID);

    const commentThread = await transaction(async client => {
        let snippetID: string;
        if (data.snippet === undefined) {
            snippetID = await SnippetDB.createNullSnippet({client});
        } else {
            const file = await FileDB.getFileByID(fileID, {client});
            const fileContent = await readFileAsString(getFilePathOnDisk(file));
            const {contextBefore, body, contextAfter} =
                getContextLines(fileContent, data.snippet.start.line, data.snippet.end.line);
            snippetID = await SnippetDB.addSnippet({
                lineStart: data.snippet.start.line,
                charStart: data.snippet.start.character,
                lineEnd: data.snippet.end.line,
                charEnd: data.snippet.end.character,
                contextBefore,
                body,
                contextAfter,
                client
            });
        }

        // Thread creation
        const submissionID: string = data.submissionID;
        return createCommentThread(request, client, snippetID, fileID, submissionID);
    });

    response.status(200).send(commentThread);
}));

// ----------- DELETE REQUESTS ----------

/**
 * Delete a comment thread
 * - requirements:
 *  - user is the owner of the comment thread (first comment)
 *  - user has permission to manage restricted comment threads
 */
commentThreadRouter.delete("/:commentThreadID", capture(async (request, response) => {
    const commentThreadID: string = request.params.commentThreadID;

    const oldCommentThread = await ThreadDB.addCommentSingle(ThreadDB.getThreadByID(commentThreadID));
    const courseID = oldCommentThread.references.courseID;
    const currentUserID: string = await getCurrentUserID(request);
    // Either user is owner of a comment thread or has permission to manage restricted comments
    if (commentThreadOwner(oldCommentThread) !== currentUserID) {
        await requirePermission(currentUserID, PermissionEnum.manageRestrictedComments, courseID);
    }

    const commentThread = await ThreadDB.deleteThread(commentThreadID);
    response.status(200).send(commentThread);
}));

