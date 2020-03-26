/** Contains functions to access all API endpoints */

import {Fetch} from "./FetchHelper";
import {CommentThread, CreateCommentThread} from "../../models/api/CommentThread";
import {Course, CoursePartial} from "../../models/api/Course";
import {Submission} from "../../models/api/Submission";
import {User} from "../../models/api/User";
import {Comment} from "../../models/api/Comment";
import {File as APIFile} from "../../models/api/File";
import {LoginProvider} from "../../models/api/LoginProvider";
import {Permission} from "../../models/api/Permission";
import {Permissions} from "../../models/api/Permission";
import {SearchResult} from '../../models/api/SearchResult';
import {Mention} from '../../models/api/Mention';
import {CourseInvite, Invite} from "../../models/api/Invite";
import {threadState} from "../../models/enums/threadStateEnum";
import {CourseUser} from "../../models/api/CourseUser";
import {courseState} from "../../models/enums/courseStateEnum";
import {Plugin} from '../../models/api/Plugin';
import {globalRole} from "../../models/enums/globalRoleEnum";
import {inviteRole} from "../../models/enums/inviteRoleEnum";
import {courseRole} from "../../models/enums/courseRoleEnum";

// Helpers
const jsonBody = <T>(method: string, body: T) => ({
    method,
    body: JSON.stringify(body),
    headers: {"Content-Type": "application/json"}
});
const postJson = <T>(body: T) => jsonBody("POST", body);
const putJson = <T>(body: T) => jsonBody("PUT", body);

// Courses
export function getCourse(courseID: string, doCache?: boolean) {
	return Fetch.fetchJson<Course>(`/api/course/${courseID}`, undefined, doCache);
}
export function getCourses(doCache?: boolean) {
	return Fetch.fetchJson<Course[]>("/api/course/", undefined, doCache);
}
export function getUserCourses(userId: string, doCache?: boolean) {
	return Fetch.fetchJson<Course[]>(`/api/course/user/${userId}`, undefined, doCache);
}
export function createCourse(course: {name: string, state: string}, doCache?: boolean) {
	return Fetch.fetchJson<Course>("/api/course", postJson(course), doCache);
}
export function updateCourse(courseID : string, update : {name? : string, state? : courseState}, doCache? : boolean) {
	return Fetch.fetchJson<CoursePartial>(`/api/course/${courseID}`, putJson(update), doCache);
}
export function courseEnrollUser(courseID : string, userID : string, doCache? : boolean) {
	return Fetch.fetchJson<CourseUser>(`/api/course/${courseID}/user/${userID}`, putJson({}), doCache);
}

// Users
export function getCurrentUser(doCache?: boolean) {
	return Fetch.fetchJson<User>("/api/user/", undefined, doCache);
}
export function getUser(userId: string, doCache?: boolean) {
	return Fetch.fetchJson<User>(`/api/user/${userId}`, undefined, doCache);
}
export function getAllUsers(doCache? : boolean) {
	return Fetch.fetchJson<User[]>(`/api/user/all`, undefined, doCache);
}
export function setUser(body : {name? : string, email? : string}, doCache? : boolean) {
	return Fetch.fetchJson<User>(`/api/user/`, putJson(body), doCache);
}
export function getUsersByCourse(courseID : string, doCache? : boolean) {
	return Fetch.fetchJson<CourseUser[]>(`/api/user/course/${courseID}`, undefined, doCache);
}

// Submissions
export function getCourseSubmissions(courseId: string, doCache?: boolean) {
	return Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}`, undefined, doCache);
}
export function getCourseUserSubmissions(courseId: string, userId: string, doCache?: boolean) {
	return Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}/user/${userId}`, undefined, doCache);
}
export function getUserSubmissions(userId: string, doCache?: boolean) {
	return Fetch.fetchJson<Submission[]>(`/api/submission/user/${userId}`, undefined, doCache);
}
export function getSubmission(submissionID: string, doCache?: boolean) {
	return Fetch.fetchJson<Submission>(`/api/submission/${submissionID}`, undefined, doCache);
}
export function createSubmission(courseId: string, projectName: string, files: File[], doCache?: boolean) {
	const form = new FormData();
	form.append("project", projectName);
	for (const file of files) {
		form.append("files", file);
	}

	return Fetch.fetchJson<Submission>(`/api/submission/course/${courseId}`, {
		method: "POST",
		body: form
		// Don't set the Content-Type header, it is automatically done by using FormData
		// and it breaks if you set it manually, as the boundaries will not be added
	}, doCache);
}

// Files
export function getFiles(submissionID: string, doCache?: boolean) {
	return Fetch.fetchJson<APIFile[]>(`/api/file/submission/${submissionID}`, undefined, doCache);
}
export function getFile(fileId: string, doCache?: boolean) {
	return Fetch.fetchJson<APIFile>(`/api/file/${fileId}`, undefined, doCache);
}
export function getFileContents(fileId: string, doCache?: boolean) {
	return Fetch.fetchString(getFileUrl(fileId), undefined, doCache);
}
export function getFileUrl(fileID: string) {
    return `/api/file/${fileID}/body`;
}

// Comments
export function getUserComments(userId: string, doCache?: boolean) {
	return Fetch.fetchJson<Comment[]>(`/api/comment/user/${userId}`, undefined, doCache);
}
export function getCourseUserComments(courseId: string, userId: string, doCache?: boolean) {
	return Fetch.fetchJson<Comment[]>(`/api/comment/course/${courseId}/user/${userId}`, undefined, doCache);
}

// CommentThreads
export function getFileComments(fileID: string, doCache?: boolean) {
	return Fetch.fetchJson<CommentThread[]>(`/api/commentThread/file/${fileID}`, undefined, doCache);
}
export function getProjectComments(submissionID: string, doCache?: boolean) {
	return Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}`, undefined, doCache);
}
export function getRecentComments(submissionID: string, doCache?: boolean) {
	return Fetch.fetchJson<CommentThread[]>(
        `/api/commentThread/submission/${submissionID}/recent`, 
        undefined, 
        doCache
    );
}
export function setCommentThreadVisibility(commentThreadID : string, visible : boolean, doCache? : boolean) {
	return Fetch.fetchJson<CommentThread>(
        `/api/commentThread/${commentThreadID}`, 
        putJson({ visibility : visible ? "public" : "private" }),
        doCache
    );
}

export function createFileCommentThread(fileID: string, thread: CreateCommentThread, doCache?: boolean) {
	return Fetch.fetchJson<CommentThread>(`/api/commentThread/file/${fileID}`, postJson(thread), doCache);
}
export function createSubmissionCommentThread(
        submissionID: string, 
        thread: {commentBody: string, visiblityState?: string}, 
        doCache?: boolean) {
	return Fetch.fetchJson<CommentThread>(`/api/commentThread/submission/${submissionID}`, postJson(thread), doCache);
}
export function createComment(commentThreadID: string, comment: {commentBody: string}, doCache?: boolean) {
	return Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}`, putJson(comment), doCache);
}

// Mentions
export function getMentions(doCache?: boolean) {
    return Fetch.fetchJson<Mention[]>('/api/mentions', undefined, doCache);
}
export function getCourseMentions(courseID: string, doCache?: boolean) {
    return Fetch.fetchJson<Mention[]>(`/api/mentions/course/${courseID}`, undefined, doCache);
}

// Search
export function search(query: string, limit = 20, offset = 0, doCache?: boolean) {
	return Fetch.fetchJson<SearchResult>(`/api/search?q=${query}&limit=${limit}&offset=${offset}`, undefined, doCache);
}
// If courseID is not present global users as searched. Permissions in a course/globally might not be set correctly yet by the database
export function searchUsers(query : string, courseID? : string, limit = 20, offset = 0, doCache? : boolean) {
	const courseSearch = courseID === undefined ? "" : `&courseID=${courseID}`;
	return Fetch.fetchJson<User[]>(
		`/api/search/users?q=${query}${courseSearch}&limit=${limit}&offset=${offset}`,
		undefined,
		doCache
	)
}
//@deprecated searchUsers is more general.
export function searchUsersInCourse(query: string, courseID: string, limit = 20, offset = 0, doCache?: boolean) {
	return Fetch.fetchJson<User[]>(
        `/api/search/users?q=${query}&courseID=${courseID}&limit=${limit}&offset=${offset}`, 
        undefined, 
        doCache
    );
}

// Auth
export function getLoginProviders(doCache?: boolean) {
	return Fetch.fetchJson<LoginProvider[]>("/api/auth/providers", undefined, doCache);
}

// Permission
export function coursePermission(courseID: string, doCache?: boolean) {
	return Fetch.fetchJson<Permission>(`/api/permission/course/${courseID}`, undefined, doCache);
}
export function permission(doCache?: boolean) {
	return Fetch.fetchJson<Permission>(`/api/permission`, undefined, doCache);
}

export function setPermissionCourse(courseID : string, userID : string, permissions : { permissions : Permissions}, doCache?: boolean) {
	return Fetch.fetchJson<CourseUser>(`/api/permission/course/${courseID}/user/${userID}`, putJson(permissions), doCache);
}
export function setPermissionGlobal(userID : string, permissions : { permissions : Permissions}, doCache? : boolean) {
	return Fetch.fetchJson<CourseUser>(`/api/permission/user/${userID}`, {
		method : "PUT",
		body : JSON.stringify(permissions),
		headers : {"Content-Type" : "application/json"}
	}, doCache);
}

// Invites
export function getInvites(courseID : string, doCache? : boolean) {
	return Fetch.fetchJson<Invite>(`/api/invite/course/${courseID}/all`, undefined, doCache);
}

export function getInvite(courseID : string, role : inviteRole, doCache? : boolean) {
	return Fetch.fetchJson<CourseInvite>(`/api/invite/course/${courseID}/role/${role}`, undefined, doCache);
}

export function deleteInvite(courseID : string, role : inviteRole, doCache?: boolean) {
	return Fetch.fetchJson<Comment>(`/api/invite/course/${courseID}/role/${role}`, { method: "DELETE" }, doCache);
}

// Role
export function updateGlobalRole(userID : string, role : globalRole, doCache? : boolean) {
	return Fetch.fetchJson<User>(`/api/role/user/${userID}/${role}`, putJson({}), doCache);
}

export function updateCourseRole(userID : string, courseID : string, role : courseRole, doCache? : boolean) {
	return Fetch.fetchJson<CourseUser>(`/api/role/course/${courseID}/user/${userID}/${role}`, putJson({}), doCache);
}

// Plugins
export function getPlugins(doCache?: boolean) {
    return Fetch.fetchJson<Plugin[]>('/api/plugin', undefined, doCache);
}

export function createPlugin(plugin: Partial<Plugin>, doCache?: boolean) {
    return Fetch.fetchJson<Plugin>('/api/plugin', postJson(plugin), doCache);
}

export function updatePlugin(plugin: Partial<Plugin> & { pluginID: string }, doCache?: boolean) {
    return Fetch.fetchJson<Plugin>(`/api/plugin/${plugin.pluginID}`, putJson(plugin), doCache);
}

export function deletePlugin(pluginID: string, doCache?: boolean) {
    return Fetch.fetchJson<User>(`/api/plugin/${pluginID}`, { method: "DELETE" }, doCache);
}
