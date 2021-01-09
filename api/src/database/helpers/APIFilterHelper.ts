import {CoursePartial} from "../../../../models/api/Course";
import {CourseUser} from "../../../../models/api/CourseUser";
import {Comment} from "../../../../models/api/Comment";
import {CommentThread} from "../../../../models/api/CommentThread";
import {Mention} from "../../../../models/api/Mention";
import {Permission} from "../../../../models/api/Permission";
import {SearchResultComment, SearchResultSnippet} from "../../../../models/api/SearchResult";
import {Submission} from "../../../../models/api/Submission";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";
import {User} from "../../../../models/api/User";
import {containsPermission, PermissionEnum} from "../../../../models/enums/PermissionEnum";

import {getCoursePermissions, getGlobalPermissions} from "./PermissionHelper";

/**
 * Filters comment thread API response. Comment threads are assumed in the same course.
 * - Comment thread is returned if PermissionEnum.viewRestrictedComments is set in permissions
 * - Comment thread is returned if user is the author of any comment in the comment thread
 * @param commentThreads, comment threads sent back to user
 * @param userID, ID of the requesting user
 * @param permissions, permissions of the user. If not set course permissions are taken from the first comment thread.
 */
export async function filterCommentThread(commentThreads: CommentThread[], userID: string, permissions?: number) {
	if (commentThreads.length === 0) {
		return commentThreads;
	}
	if (permissions === undefined) {
		const courseID: string = commentThreads[0].references.courseID;
		permissions = await getCoursePermissions(userID, courseID);
	}
	if (!containsPermission(PermissionEnum.viewRestrictedComments, permissions)) {
		return commentThreads.filter((commentThread: CommentThread) =>
			commentThread.visibility === ThreadState.public ||
			userPartOfCommentThread(userID, commentThread)
		);
	}
	return commentThreads;
}

/**
 * Filters comment API response. Comments are assumed in the same course.
 * - Comment is returned if PermissionEnum.viewRestrictedComments is set in permissions
 * - Comment is returned if user is the author of the comment
 * @param comments, comments sent back to user
 * @param userID, ID of the requesting user
 * @param permissions, permissions of the user. If not set course permissions are taken from the first comment.
 */
export async function filterComments(comments: Comment[], userID: string, permissions?: number) {
	if (comments.length === 0) {
		return comments;
	}
	if (permissions === undefined) {
		const courseID: string = comments[0].references.courseID;
		permissions = await getCoursePermissions(userID, courseID);
	}
	if (!containsPermission(PermissionEnum.viewRestrictedComments, permissions)) {
		return comments.filter((comment: Comment) =>
			comment.thread.visibility === ThreadState.public ||
			comment.user.ID === userID
		);
	}
	return comments;
}

/**
 * Filter course API response.
 * - course is returned if Permission.viewAllCourses is set in permissions
 * - course is returned if user is enrolled in the course
 * @param courses, courses to filter
 * @param enrolled, user enrolled courses
 * @param userID, ID of the requesting user
 * @param permissions, permissions of the user. If not set global permissions of the user are used.
 */
export async function filterCourse(courses: CoursePartial[], enrolled: string[], userID: string, permissions?: number) {
	if (permissions === undefined) {
		permissions = await getGlobalPermissions(userID);
	}
	if (!containsPermission(PermissionEnum.viewAllCourses, permissions)) {
		return courses.filter((course: CoursePartial) => enrolled.includes(course.ID));
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
export async function filterSubmission(submissions: Submission[], userID: string, permissions?: number) {
	if (submissions.length === 0) {
		return submissions;
	}
	if (permissions === undefined) {
		const courseID: string = submissions[0].references.courseID;
		permissions = await getCoursePermissions(userID, courseID);
	}
	if (!containsPermission(PermissionEnum.viewAllSubmissions, permissions)) {
		return submissions.filter((submission: Submission) => submission.user.ID === userID);
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
export async function filterUser(users: User[], userID: string, permissions?: number) {
	if (permissions === undefined) {
		permissions = await getGlobalPermissions(userID);
	}
	if (!containsPermission(PermissionEnum.viewAllUserProfiles, permissions)) {
		return users.filter((user: User) => user.ID === userID);
	}
	return users;
}

export function removePermissions(permission: Permission) {
	permission.permissions = 0;
	return permission;
}
export function removePermissionsComment(comment: Comment) {
	removePermissionsUser(comment.user);
	return comment;
}
export function removePermissionsCommentThread(commentThread: CommentThread) {
	commentThread.comments.forEach(comment => removePermissionsComment(comment));
	return commentThread;
}
export function removePermissionsCoursePartial(coursePartial: CoursePartial) {
	removePermissionsUser(coursePartial.creator);
	return coursePartial;
}
export function removePermissionsSubmission(submission: Submission) {
	removePermissionsUser(submission.user);
	return submission;
}
export function removePermissionsMention(mention: Mention) {
	if (mention.user) {
		removePermissionsUser(mention.user);
	}
	return mention;
}
export function removePermissionsUser(user: User) {
	removePermissions(user.permission);
	return user;
}
export function removePermissionsCourseUser(user: CourseUser) {
	removePermissions(user.permission);
	return user;
}
export function removePermissionsSearchResultComments(comments: SearchResultComment[]) {
	return comments.map(comment => {
		removePermissionsComment(comment.comment);
		removePermissionsSubmission(comment.submission);
		return comment;
	});
}
export function removePermissionsSearchResultSnippets(snippets: SearchResultSnippet[]) {
	return snippets.map(snippet => {
		removePermissionsSubmission(snippet.submission);
		return snippet;
	});
}

/**
 * Checks whether a user is part of a comment thread
 * @param userID, ID of the requesting user
 * @param commentThread, commentThread to check
 */
function userPartOfCommentThread(userID: string, commentThread: CommentThread) {
	return commentThread.comments.some((comment: Comment) => comment.user.ID === userID);
}