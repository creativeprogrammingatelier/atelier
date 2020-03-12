import {CommentThread} from "../../../models/api/CommentThread";
import {getCoursePermissions, getGlobalPermissions} from "./PermissionHelper";
import {containsPermission, PermissionEnum} from "../../../enums/permissionEnum";
import {CoursePartial} from "../../../models/api/Course";
import {Comment} from "../../../models/api/Comment";
import {Submission} from "../../../models/api/Submission";
import {threadState} from "../../../enums/threadStateEnum";

export async function filterCommentThread(commentThreads : CommentThread[], userID : string) {
    if (commentThreads.length == 0) return commentThreads;
    const courseID : string = commentThreads[0].references.courseID;
    const permissions : number = await getCoursePermissions(userID, courseID);
    if (!containsPermission(PermissionEnum.viewRestrictedComments, permissions)) {
        return commentThreads.filter((commentThread : CommentThread) => commentThread.visibility === threadState.public);
    }
    return commentThreads;
}

export async function filterCourse(courses : CoursePartial[], enrolled : string[], userID : string) {
    const permissions : number = await getGlobalPermissions(userID);
    if (!containsPermission(PermissionEnum.viewAllCourses, permissions)) {
        return courses.filter((course : CoursePartial) => enrolled.includes(course.ID));
    }
    return courses;
}

export async function filterSubmission(submissions : Submission[], userID : string) {
    if (submissions.length == 0) return submissions;
    const courseID : string = submissions[0].references.courseID;
    const permissions : number = await getCoursePermissions(userID, courseID);
    if (!containsPermission(PermissionEnum.viewAllSubmissions, permissions)) {
        return submissions.filter((submission : Submission) => submission.user.ID === userID);
    }
    return submissions;
}

export async function filterComment(comments : Comment[], userID : string) {

}