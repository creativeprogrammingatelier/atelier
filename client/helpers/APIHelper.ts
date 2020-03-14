/** Contains functions to access all API endpoints */

import {Fetch} from "./FetchHelper";
import {CommentThread} from "../../models/api/CommentThread";
import {Course} from "../../models/api/Course";
import {Submission} from "../../models/api/Submission";
import {User} from "../../models/api/User";
import {Comment} from "../../models/api/Comment";
import {File as APIFile} from "../../models/api/File";
import {threadState} from "../../enums/threadStateEnum";
import {LoginProvider} from "../../models/api/LoginProvider";
import {Permission} from "../../models/api/Permission";
import {SearchResult} from '../../models/api/SearchResult';
import {Mention} from '../../models/api/Mention';

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
	return Fetch.fetchJson<Course>("/api/course", {
		method: "POST",
		body: JSON.stringify(course),
		headers: {"Content-Type": "application/json"}
	}, doCache);
}

// Users
export function getCurrentUser(doCache?: boolean) {
	return Fetch.fetchJson<User>("/api/user/", undefined, doCache);
}
export function getUser(userId: string, doCache?: boolean) {
	return Fetch.fetchJson<User>(`/api/user/${userId}`, undefined, doCache);
}
export function setUser(body : {name? : string, email? : string}, doCache? : boolean) {
	return Fetch.fetchJson<User>(`/api/user/`, {
		method : "PUT",
		body : JSON.stringify(body),
		headers : {"Content-Type" : "application/json"}
	}, doCache);
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
	return Fetch.fetchString(`/api/file/${fileId}/body`, undefined, doCache);
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
	return Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}/recent`, undefined, doCache);
}

interface CommentThreadProperties {
	snippetBody?: string,
	lineStart?: number,
	charStart?: number,
	lineEnd?: number,
	charEnd?: number,
	visibilityState?: threadState,
	commentBody: string,
	submissionID: string
}
export function createFileCommentThread(fileID: string, thread: CommentThreadProperties, doCache?: boolean) {
	return Fetch.fetchJson<CommentThread>(`/api/commentThread/file/${fileID}`, {
		method: "POST",
		body: JSON.stringify(thread),
		headers: {"Content-Type": "application/json"}
	}, doCache);
}
export function createSubmissionCommentThread(submissionID: string, body: {commentBody: string}, doCache?: boolean) {
	return Fetch.fetchJson<CommentThread>(`/api/commentThread/submission/${submissionID}`, {
		method: "POST",
		body: JSON.stringify(body),
		headers: {"Content-Type": "application/json"}
	}, doCache);
}
export function createComment(commentThreadID: string, comment: {commentBody: string}, doCache?: boolean) {
	return Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}`, {
		method: "PUT",
		body: JSON.stringify(comment),
		headers: {"Content-Type": "application/json"}
	}, doCache);
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
export function searchUsersInCourse(query: string, courseID: string, limit = 20, offset = 0, doCache?: boolean) {
	return Fetch.fetchJson<User[]>(`/api/search/users?q=${query}&courseID=${courseID}&limit=${limit}&offset=${offset}`, undefined, doCache);
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
