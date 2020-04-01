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
import {SearchResult} from "../../models/api/SearchResult";
import {Mention} from "../../models/api/Mention";
import {CourseInvite, Invite} from "../../models/api/Invite";
import {CourseUser} from "../../models/api/CourseUser";
import {CourseState} from "../../models/enums/courseStateEnum";
import {Plugin} from "../../models/api/Plugin";
import {GlobalRole} from "../../models/enums/globalRoleEnum";
import {InviteRole} from "../../models/enums/inviteRoleEnum";
import {CourseRole} from "../../models/enums/courseRoleEnum";
import {Sorting} from "../../models/enums/SortingEnum";
// Helpers
const jsonBody = <T>(method: string, body: T) => ({
	method,
	body: JSON.stringify(body),
	headers: {"Content-Type": "application/json"}
});
const postJson = <T>(body: T) => jsonBody("POST", body);
const putJson = <T>(body: T) => jsonBody("PUT", body);
/**
 * function that takes an object specifying key:value pairs, and creating something that can be added to the end of an url.
 * @param params an object specifying parameters to send to the backend
 */
const addParams = (params: {[key: string]: string | number | boolean}) => {
	if (!params) return ''
	const keys = Object.keys(params);
	const items : string[]= []
	keys.forEach(key => {
		items.push(encodeURIComponent(key)+'='+encodeURIComponent(params[key]))
	});
	if (items.length > 0) {
		return '?'+items.join('&')
	} else {
		return ''
	}
};
// Courses
export function getCourse(courseID: string) {
	return Fetch.fetchJson<Course>(`/api/course/${courseID}`);
}
export function getCourses() {
	return Fetch.fetchJson<Course[]>("/api/course/");
}
export function getUserCourses(userId: string) {
	return Fetch.fetchJson<Course[]>(`/api/course/user/${userId}`);
}
export function createCourse(course: {name: string, state: string}) {
	return Fetch.fetchJson<Course>("/api/course", postJson(course));
}
export function updateCourse(courseID: string, update: {name?: string, state?: CourseState}) {
	return Fetch.fetchJson<CoursePartial>(`/api/course/${courseID}`, putJson(update));
}
export function courseEnrollUser(courseID: string, userID: string) {
	return Fetch.fetchJson<CourseUser>(`/api/course/${courseID}/user/${userID}`, putJson({}));
}

// Users
export function getCurrentUser() {
	return Fetch.fetchJson<User>("/api/user/");
}
export function getUser(userId: string) {
	return Fetch.fetchJson<User>(`/api/user/${userId}`);
}
export function getAllUsers() {
	return Fetch.fetchJson<User[]>(`/api/user/all`);
}
export function setUser(body: {name?: string, email?: string}) {
	return Fetch.fetchJson<User>(`/api/user/`, putJson(body));
}
export function getUsersByCourse(courseID: string) {
	return Fetch.fetchJson<CourseUser[]>(`/api/user/course/${courseID}`);
}

// Submissions
export function getCourseSubmissions(courseId: string) {
	return Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}`);
}
export function getCourseUserSubmissions(courseId: string, userId: string) {
	return Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}/user/${userId}`);
}
export function getUserSubmissions(userId: string) {
	return Fetch.fetchJson<Submission[]>(`/api/submission/user/${userId}`);
}
export function getSubmission(submissionID: string) {
	return Fetch.fetchJson<Submission>(`/api/submission/${submissionID}`);
}
export function createSubmission(courseId: string, projectName: string, files: File[]) {
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
	});
}

// Files
export function getFiles(submissionID: string) {
	return Fetch.fetchJson<APIFile[]>(`/api/file/submission/${submissionID}`);
}
export function getFile(fileId: string) {
	return Fetch.fetchJson<APIFile>(`/api/file/${fileId}`);
}
export function getFileContents(fileId: string) {
	return Fetch.fetchString(getFileUrl(fileId));
}
export function getFileUrl(fileID: string) {
	return `/api/file/${fileID}/body`;
}

// Comments
export function getUserComments(userId: string) {
	return Fetch.fetchJson<Comment[]>(`/api/comment/user/${userId}`);
}
export function getCourseUserComments(courseId: string, userId: string) {
	return Fetch.fetchJson<Comment[]>(`/api/comment/course/${courseId}/user/${userId}`);
}

// CommentThreads
export function getFileComments(fileID: string) {
	return Fetch.fetchJson<CommentThread[]>(`/api/commentThread/file/${fileID}`);
}
export function getProjectComments(submissionID: string) {
	return Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}`);
}
export function getRecentComments(submissionID: string) {
	return Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}/recent`);
}
export function setCommentThreadVisibility(commentThreadID: string, visible: boolean) {
	return Fetch.fetchJson<CommentThread>(
		`/api/commentThread/${commentThreadID}`,
		putJson({ visibility : visible ? "public" : "private" })
	);
}

export function createFileCommentThread(fileID: string, thread: CreateCommentThread) {
	return Fetch.fetchJson<CommentThread>(`/api/commentThread/file/${fileID}`, postJson(thread));
}

export function createSubmissionCommentThread(submissionID: string, thread: CreateCommentThread) {
	return Fetch.fetchJson<CommentThread>(`/api/commentThread/submission/${submissionID}`, postJson(thread));
}
export function createComment(commentThreadID: string, comment: string) {
	return Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}`, putJson({comment}));
}

// Mentions
export function getMentions() {
	return Fetch.fetchJson<Mention[]>("/api/mentions");
}
export function getCourseMentions(courseID: string) {
	return Fetch.fetchJson<Mention[]>(`/api/mentions/course/${courseID}`);
}

// Search
interface SearchParameters {
	query: string,
	limit?: number,
	offset?: number,
	sorting?: Sorting,
	courseID?: string,
	userID?: string,
	submissionID?: string
}
export function search({query, limit = 20, offset = 0, sorting=Sorting.datetime, courseID, userID, submissionID}: SearchParameters, doCache?: boolean) {
	const path = `/api/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}${sorting? `&sort=${sorting}`:``}${courseID ? `&courseID=${courseID}` : ``}${userID ? `&userID=${userID}` : ""}${submissionID ? `&submissionID=${submissionID}` : ""}`;
	return Fetch.fetchJson<SearchResult>(path);
}
// If courseID is not present global users as searched. Permissions in a course/globally might not be set correctly yet by the database
export function searchUsers(query: string, courseID?: string, limit = 20, offset = 0) {
	const courseSearch = courseID === undefined ? "" : `&courseID=${courseID}`;
	return Fetch.fetchJson<User[]>(`/api/search/users?q=${query}${courseSearch}&limit=${limit}&offset=${offset}`);
}
//@deprecated searchUsers is more general.
export function searchUsersInCourse(query: string, courseID: string, limit = 20, offset = 0) {
	return Fetch.fetchJson<User[]>(`/api/search/users?q=${query}&courseID=${courseID}&limit=${limit}&offset=${offset}`);
}

// Auth
export function getLoginProviders() {
	return Fetch.fetchJson<LoginProvider[]>("/api/auth/providers");
}

// Permission
export function coursePermission(courseID: string) {
	return Fetch.fetchJson<Permission>(`/api/permission/course/${courseID}`);
}
export function permission() {
	return Fetch.fetchJson<Permission>(`/api/permission`);
}

export function setPermissionCourse(courseID: string, userID: string, permissions: Permissions) {
	return Fetch.fetchJson<CourseUser>(`/api/permission/course/${courseID}/user/${userID}`, putJson({permissions}));
}
export function setPermissionGlobal(userID: string, permissions: Permissions) {
	return Fetch.fetchJson<CourseUser>(`/api/permission/user/${userID}`, putJson({permissions}));
}

// Invites
export function getInvites(courseID: string) {
	return Fetch.fetchJson<Invite>(`/api/invite/course/${courseID}/all`);
}

export function getInvite(courseID: string, role: InviteRole) {
	return Fetch.fetchJson<CourseInvite>(`/api/invite/course/${courseID}/role/${role}`);
}

export function deleteInvite(courseID: string, role: InviteRole) {
	return Fetch.fetchJson<Comment>(`/api/invite/course/${courseID}/role/${role}`, {method: "DELETE"});
}

// Role
export function updateGlobalRole(userID: string, role: GlobalRole) {
	return Fetch.fetchJson<User>(`/api/role/user/${userID}/${role}`, putJson({}));
}

export function updateCourseRole(userID: string, courseID: string, role: CourseRole) {
	return Fetch.fetchJson<CourseUser>(`/api/role/course/${courseID}/user/${userID}/${role}`, putJson({}));
}

// Plugins
export function getPlugins() {
	return Fetch.fetchJson<Plugin[]>("/api/plugin");
}

export function createPlugin(plugin: Partial<Plugin>) {
	return Fetch.fetchJson<Plugin>("/api/plugin", postJson(plugin));
}

export function updatePlugin(plugin: Partial<Plugin> & {pluginID: string}) {
	return Fetch.fetchJson<Plugin>(`/api/plugin/${plugin.pluginID}`, putJson(plugin));
}

export function deletePlugin(pluginID: string) {
	return Fetch.fetchJson<User>(`/api/plugin/${pluginID}`, {method: "DELETE"});
}
