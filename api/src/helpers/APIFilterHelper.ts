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
 * Filters comment thread API response
 * - Comment thread is returned if PermissionEnum.viewRestrictedComments is set in permissions
 * - Comment thread is returned if user is the author of any comment in the comment thread
 * @param commentThreads, comment threads sent back to user
 * @param userID, ID of the requesting user
 */
export async function filterCommentThread(commentThreads : CommentThread[], userID : string) {
    if (commentThreads.length === 0) return commentThreads;
    const courseID : string = commentThreads[0].references.courseID;
    const permissions : number = await getCoursePermissions(userID, courseID);
    if (!containsPermission(PermissionEnum.viewRestrictedComments, permissions)) {
        return commentThreads.filter((commentThread : CommentThread) =>
            commentThread.visibility === threadState.public ||
            userPartOfCommentThread(userID, commentThread)
        );
    }
    return commentThreads;
}

/**
 * Filter course API response
 * @param courses, courses to filter
 * @param enrolled, user enrolled courses
 * @param userID, ID of the requesting user
 */
export async function filterCourse(courses : CoursePartial[], enrolled : string[], userID : string) {
    const permissions : number = await getGlobalPermissions(userID);
    if (!containsPermission(PermissionEnum.viewAllCourses, permissions)) {
        return courses.filter((course : CoursePartial) => enrolled.includes(course.ID));
    }
    return courses;
}

/**
 * Filter submission API response
 * @param submissions, submissions to filter
 * @param userID, ID of the requesting user
 */
export async function filterSubmission(submissions : Submission[], userID : string) {
    if (submissions.length === 0) return submissions;
    const courseID : string = submissions[0].references.courseID;
    const permissions : number = await getCoursePermissions(userID, courseID);
    if (!containsPermission(PermissionEnum.viewAllSubmissions, permissions)) {
        return submissions.filter((submission : Submission) => submission.user.ID === userID);
    }
    return submissions;
}

export async function filterComment(comments : Comment[], userID : string) {
    // TODO filter
    return comments;
}

export async function filterUser(users : User[], userID : string) {
    // TODO filter
    return users;
}

export async function filterSnippet(snippets : Snippet[], userID : string) {
    // TODO filter
    return snippets;
}

function userPartOfCommentThread(userID : string, commentThread : CommentThread) {
    return commentThread.comments.some((comment : Comment) => comment.ID === userID);
}


