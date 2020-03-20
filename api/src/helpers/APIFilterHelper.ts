import {CommentThread} from "../../../models/api/CommentThread";
import {getCoursePermissions, getGlobalPermissions} from "./PermissionHelper";
import {containsPermission, PermissionEnum} from "../../../models/enums/permissionEnum";
import {CoursePartial} from "../../../models/api/Course";
import {Comment} from "../../../models/api/Comment";
import {Submission} from "../../../models/api/Submission";
import {threadState} from "../../../models/enums/threadStateEnum";
import {User} from "../../../models/api/User";
import {Snippet} from "../../../models/api/Snippet";

/**
 * Filters comment thread API response. Comment threads are assumed in the same course.
 * - Comment thread is returned if PermissionEnum.viewRestrictedComments is set in permissions
 * - Comment thread is returned if user is the author of any comment in the comment thread
 * @param commentThreads, comment threads sent back to user
 * @param userID, ID of the requesting user
 * @param permissions, permissions of the user. If not set course permissions are taken from the first comment thread.
 */
export async function filterCommentThread(commentThreads : CommentThread[], userID : string, permissions? : number) {
    if (commentThreads.length === 0) return commentThreads;
    if (permissions === undefined) {
        const courseID : string = commentThreads[0].references.courseID;
        permissions = await getCoursePermissions(userID, courseID);
    }
    if (!containsPermission(PermissionEnum.viewRestrictedComments, permissions)) {
        return commentThreads.filter((commentThread : CommentThread) =>
            commentThread.visibility === threadState.public ||
            userPartOfCommentThread(userID, commentThread)
        );
    }
    return commentThreads;
}

/**
 * Filter course API response.
 * - Course is returned if Permission.viewAllCourses is set in permissions
 * - Course is returned if user is enrolled in the course
 * @param courses, courses to filter
 * @param enrolled, user enrolled courses
 * @param userID, ID of the requesting user
 * @param permissions, permissions of the user. If not set global permissions of the user are used.
 */
export async function filterCourse(courses : CoursePartial[], enrolled : string[], userID : string, permissions? : number) {
    if (permissions === undefined) {
        permissions = await getGlobalPermissions(userID);
    }
    if (!containsPermission(PermissionEnum.viewAllCourses, permissions)) {
        return courses.filter((course : CoursePartial) => enrolled.includes(course.ID));
    }
    return courses;
}

/**
 * Filter submission API response. Submissions are assumed in the same course.
 * - Submission is returned if Permission.viewAllSubmissions is set in permissions
 * - Submission is returned if user is the author of the submission
 * @param submissions, submissions to filter
 * @param userID, ID of the requesting user
 * @param permissions, permissions of the user. If not set course permissions of the user are taken.
 */
export async function filterSubmission(submissions : Submission[], userID : string, permissions? : number) {
    if (submissions.length === 0) return submissions;
    if (permissions === undefined) {
        const courseID: string = submissions[0].references.courseID;
        permissions = await getCoursePermissions(userID, courseID);
    }
    if (!containsPermission(PermissionEnum.viewAllSubmissions, permissions)) {
        return submissions.filter((submission : Submission) => submission.user.ID === userID);
    }
    return submissions;
}

/**
 * Filter user API response.
 * - User is returned if Permission.viewAllUserProfiles is set in permissions
 * - User is returned if it is the requesting user
 * @param users, users to filter
 * @param userID, ID of the requesting user
 * @param permissions, permissions of the user. If not set global permissions of the user are taken.
 */
export async function filterUser(users : User[], userID : string, permissions? : number) {
    if (permissions === undefined) {
        permissions = await getGlobalPermissions(userID);
    }
    if (!containsPermission(PermissionEnum.viewAllUserProfiles, permissions)) {
        return users.filter((user : User) => user.ID === userID);
    }
    return users;
}


export async function filterSnippet(snippets : Snippet[], userID : string, permissions? : number) {
    // TODO how to filter. Would require querying each submission to get author.
    return snippets;
}

export async function filterComment(comments : Comment[], userID : string, permissions? : number) {
    // TODO how to filter. Would requires querying all comment threads for visibility.
    return comments;
}

function userPartOfCommentThread(userID : string, commentThread : CommentThread) {
    return commentThread.comments.some((comment : Comment) => comment.ID === userID);
}