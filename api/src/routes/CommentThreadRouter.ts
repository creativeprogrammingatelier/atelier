/**
 * Api routes relating to comment threads
 */

import express, {Request} from 'express';
import {threadState} from "../../../models/enums/threadStateEnum";
import {ThreadDB} from "../database/ThreadDB";
import {SnippetDB} from "../database/SnippetDB";

import {CommentThread, CreateCommentThread} from "../../../models/api/CommentThread";
import {capture} from "../helpers/ErrorHelper";
import {FileDB} from "../database/FileDB";
import {CommentDB} from "../database/CommentDB";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {pgDB, transaction} from "../database/HelperDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {
    requirePermission,
    requireRegisteredCommentThreadID,
    requireRegisteredFileID,
    requireRegisteredSubmissionID
} from "../helpers/PermissionHelper";
import {filterCommentThread} from "../helpers/APIFilterHelper";
import {getMentions} from '../helpers/MentionsHelper';
import {MentionsDB} from '../database/MentionsDB';
import {commentThreadOwner} from "../../../client/src/helpers/CommentThreadHelper";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import { readFileAsString } from '../helpers/FilesystemHelper';
import { getContextLines } from '../../../helpers/SnippetHelper';

export const commentThreadRouter = express.Router();
commentThreadRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * Get a specific comment thread.
 * - requirements:
 *  - user is registered in the course of the commentThread
 */
commentThreadRouter.get('/:commentThreadID', capture(async (request, response) => {
    const commentThreadID : string = request.params.commentThreadID;
    const currentUserID : string = await getCurrentUserID(request);

    // User should be registered in the course
    await requireRegisteredCommentThreadID(currentUserID, commentThreadID);

    const thread : CommentThread = await ThreadDB.addCommentSingle(ThreadDB.getThreadByID(commentThreadID));
    response.status(200).send(thread);
}));

/**
 * Get comment threads of a file.
 * - requirements:
 *  - user is registered in the course of the commentThread
 * - notes:
 *  - requires permission to view private comment threads
 */
commentThreadRouter.get('/file/:fileID', capture(async (request, response) => {
    const fileID = request.params.fileID;
    const currentUserID : string = await getCurrentUserID(request);

    // User should be registered in the course
    await requireRegisteredFileID(currentUserID, fileID);

    // Retrieve comment threads, and filter out restricted comment threads if user does not have access
    const commentThreads : CommentThread[] = await ThreadDB.addComments(ThreadDB.getThreadsByFile(fileID));
    response.status(200).send(await filterCommentThread(commentThreads, currentUserID));
}));

/**
 * Get comment threads of a submission (general project comments).
 * - requirements:
 *  - user is registered in the course of the submission
 * - notes:
 *  - requires permission to view private comment threads
 */
commentThreadRouter.get('/submission/:submissionID', capture(async (request, response) => {
    const submissionID = request.params.submissionID;
    const nullFileID = await FileDB.getNullFileID(submissionID);
    const currentUserID = await getCurrentUserID(request);

    // User should be registered in the course
    await requireRegisteredSubmissionID(currentUserID, submissionID);

    // Retrieve comment threads, and filter out restricted comment threads if user does not have access
    const commentThreads : CommentThread[] = await ThreadDB.addComments(ThreadDB.getThreadsByFile(nullFileID));
    response.status(200).send(await filterCommentThread(commentThreads, currentUserID));
}));

/**
 * Get recent comment threads of project (limited)
 * - requirements:
 *  - user is registered in the course of the submission
 * - notes:
 *  - requires permission to view private comment threads
 */
commentThreadRouter.get('/submission/:submissionID/recent', capture(async (request, response) => {
    const submissionID = request.params.submissionID;
    const limit : number | undefined = request.headers.limit as unknown as number;
    const currentUserID : string = await getCurrentUserID(request);

    // User should be registered in the course
    await requireRegisteredSubmissionID(currentUserID, submissionID);

    // Retrieve comment threads, and filter out restricted comment threads if user does not have access
    const commentThreads : CommentThread[] = await ThreadDB.addComments(ThreadDB.getThreadsBySubmission(submissionID, {limit}));
    response.status(200).send(await filterCommentThread(commentThreads, currentUserID));
}));

/** ---------- PUT ---------- */
/**
 * Update comment thread state (visibility)
 * - requirements:
 *  - user is the owner of the comment thread (first comment)
 *  - user has permission to manage restricted comment threads
 */
commentThreadRouter.put('/:commentThreadID', capture(async (request, response) => {
    const commentThreadID : string = request.params.commentThreadID;
    const visibilityState : threadState | undefined = request.body.visibility as threadState;

    const oldCommentThread : CommentThread = await ThreadDB.getThreadByID(commentThreadID);
    const courseID : string = oldCommentThread.references.courseID;
    const currentUserID : string = await getCurrentUserID(request);
    // Either use is owner of a comment thread or has permission to manage restricted comments
    if (commentThreadOwner(oldCommentThread) !== currentUserID) {
        await requirePermission(currentUserID, PermissionEnum.manageRestrictedComments, courseID);
    }

    const commentThread : CommentThread = await ThreadDB.updateThread({
        commentThreadID,
        visibilityState
    });
    response.status(200).send(commentThread);
}));


/** ---------- POST REQUESTS ---------- */

/**
 * Create a comment thread
 * @param snippetID, ID of the snippet
 * @param fileID, ID of the file
 * @param submissionID, ID of the submission
 * @param request, request from the user
 * @param client, database client for transaction
 */
async function createCommentThread(request: Request, client: pgDB, snippetID?: string, fileID?: string, submissionID?: string) {
    const commentThread : CommentThread = await ThreadDB.addThread({
        submissionID,
        fileID,
        snippetID,
        visibilityState : request.body.visiblityState ? request.body.visibilityState : threadState.public,
        client
    });

    // Comment creation
    const commentBody : string = request.body.commentBody;
    const userID : string = await getCurrentUserID(request);

    const comment = await CommentDB.addComment({
        commentThreadID : commentThread.ID,
        userID,
        body : commentBody,
        client
    });

    const mentionedUsers = await getMentions(commentBody, comment.references.courseID, client);
    for (const user of mentionedUsers) {
        await MentionsDB.addMention({ userID: user.ID, commentID: comment.ID, client });
    }

    return { ...commentThread, comments: commentThread.comments.concat(comment) };
}

/**
 * Create comment thread on a submission. General comment thread.
 * - requirements:
 *  - user is registered in the course of the submission
 */
commentThreadRouter.post('/submission/:submissionID', capture(async (request, response) => {
    const currentUserID = await getCurrentUserID(request);
    const submissionID = request.params.submissionID;

    // User should be registered in the course
    await requireRegisteredSubmissionID(currentUserID, submissionID);

    const commentThread = await transaction(async client => {
        // Snippet creation
        const snippetID : string | undefined = await SnippetDB.createNullSnippet({client});

        // Thread creation
        const fileID : string = await FileDB.getNullFileID(submissionID, {client}) as unknown as string;
        return  createCommentThread(request, client, snippetID, fileID, submissionID);
    });

    response.send(commentThread);
}));


/**
 * Create comment thread on a file.
 * - requirements:
 *  - user is registered in the course of the file
 */
commentThreadRouter.post('/file/:fileID', capture(async (request, response) => {
    const fileID = request.params.fileID;
    const currentUserID = await getCurrentUserID(request);
    const ct = request.body as CreateCommentThread;

    // User should be registered in course
    await requireRegisteredFileID(currentUserID, fileID);

    const commentThread = await transaction(async client => {
        let snippetID: string;
        if (ct.snippet === undefined) {
            snippetID = await SnippetDB.createNullSnippet({client});
        } else {
            const file = await FileDB.getFileByID(fileID, {client});
            const fileContent = await readFileAsString(file.name);
            const { contextBefore, body, contextAfter } = 
                getContextLines(fileContent, ct.snippet.lineStart, ct.snippet.lineEnd);
            snippetID = await SnippetDB.addSnippet({
                lineStart: ct.snippet.lineStart,
                charStart: ct.snippet.charStart,
                lineEnd: ct.snippet.lineEnd,
                charEnd: ct.snippet.charEnd,
                contextBefore,
                body,
                contextAfter,
                client
            });
        }

        // Thread creation
        const submissionID: string = ct.submissionID;
        return createCommentThread(request, client, snippetID, fileID, submissionID);
    });

    response.status(200).send(commentThread);
}));


