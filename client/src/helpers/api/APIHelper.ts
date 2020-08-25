import {Comment} from "../../../../models/api/Comment";
import {CommentThread, CreateCommentThread} from "../../../../models/api/CommentThread";
import {Course, CoursePartial} from "../../../../models/api/Course";
import {CourseUser} from "../../../../models/api/CourseUser";
import {File as APIFile} from "../../../../models/api/File";
import {CourseInvite, Invite} from "../../../../models/api/Invite";
import {LoginProvider} from "../../../../models/api/LoginProvider";
import {Mention} from "../../../../models/api/Mention";
import {Tag} from "../../../../models/api/Tag";
import {Permission, Permissions} from "../../../../models/api/Permission";
import {Plugin} from "../../../../models/api/Plugin";
import {SearchResult} from "../../../../models/api/SearchResult";
import {Submission} from "../../../../models/api/Submission";
import {User} from "../../../../models/api/User";
import {FeedItem} from "../../../../models/api/FeedItem";

import {CourseState} from "../../../../models/enums/CourseStateEnum";
import {CourseRole} from "../../../../models/enums/CourseRoleEnum";
import {GlobalRole} from "../../../../models/enums/GlobalRoleEnum";
import {InviteRole} from "../../../../models/enums/InviteRoleEnum";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";

import "../../../../helpers/Extensions";
import {ParameterHelper, PaginationParameters} from "../ParameterHelper";

import {Fetch} from "./FetchHelper";

/**
 * Contains functions to access all API endpoints
 */

// JSON helpers
const jsonBody = <T>(method: string, body: T) => ({
		method,
		body: JSON.stringify(body),
		headers: {"Content-Type": "application/json"}
	});
const postJson = <T>(body: T) => jsonBody("POST", body);
const putJson = <T>(body: T) => jsonBody("PUT", body);

// Courses
export const getCourse = (courseID: string) => {
	return Fetch.fetchJson<Course>(`/api/course/${courseID}`);
};
export const getCourses = () => {
	return Fetch.fetchJson<Course[]>("/api/course/");
};
export const getUserCourses = (userId: string) => {
	return Fetch.fetchJson<Course[]>(`/api/course/user/${userId}`);
};
export const createCourse = (course: {name: string, state: string}) => {
	return Fetch.fetchJson<Course>("/api/course", postJson(course));
};
export const updateCourse = (courseID: string, update: {name?: string, state?: CourseState}) => {
	return Fetch.fetchJson<CoursePartial>(`/api/course/${courseID}`, putJson(update));
};
export const courseEnrollUser = (courseID: string, userID: string, role: CourseRole) => {
	return Fetch.fetchJson<CourseUser>(`/api/course/${courseID}/user/${userID}/role/${role}`, putJson({}));
};
export const courseDisenrollUser = (courseID: string, userID: string) => {
	return Fetch.fetchJson<CourseUser>(`/api/course/${courseID}/user/${userID}`, {"method": "DELETE"});
};
export const deleteCourse = (courseID: string) => {
	return Fetch.fetchJson<CoursePartial>(`/api/course/${courseID}`, {"method": "DELETE"});
};

// Users
export const getCurrentUser = () => {
	return Fetch.fetchJson<User>("/api/user/");
};
export const getUser = (userId: string) => {
	return Fetch.fetchJson<User>(`/api/user/${userId}`);
};
export const getAllUsers = () => {
	return Fetch.fetchJson<User[]>(`/api/user/all`);
};
export const setUser = (body: Partial<User>) => {
	return Fetch.fetchJson<User>(`/api/user/`, putJson(body));
};
export const getUsersByCourse = (courseID: string) => {
	return Fetch.fetchJson<CourseUser[]>(`/api/user/course/${courseID}`);
};

// Submissions
export const getCourseSubmissions = (courseId: string, pagination?: PaginationParameters) => {
	return Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}` + ParameterHelper.createQueryParameters({...pagination}));
};
export const getCourseUserSubmissions = (courseId: string, userId: string, pagination?: PaginationParameters) => {
	return Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}/user/${userId}` + ParameterHelper.createQueryParameters({...pagination}));
};
export const getUserSubmissions = (userId: string, pagination?: PaginationParameters) => {
	return Fetch.fetchJson<Submission[]>(`/api/submission/user/${userId}` + ParameterHelper.createQueryParameters({...pagination}));
};
export const getSubmission = (submissionID: string) => {
	return Fetch.fetchJson<Submission>(`/api/submission/${submissionID}`);
};
export const createSubmission = (courseId: string, projectName: string, files: File[]) => {
	const fixFilePath = (file: File) => {
		// Chromium and EdgeHTML will set the formdata filename to webkitRelativePath,
		// but Safari uses the name, so we'll set the name to webkitRelativePath
		try {
			const nf = new File([file], file.webkitRelativePath || file.name, {type: file.type, lastModified: file.lastModified});
			// But Firefox will replace the / in the file path with : if we set it as the file
			// name, so if that happens we use the original file (which works fine in Firefox)
			// This may cause issues when there are files with : in their names, but at least
			// in Windows that's illegal and it seems pretty uncommon overall
			if (nf.name.includes(":")) {
				return file;
			} else {
				return nf;
			}
		} catch (err) {
			// EdgeHTML, however, does not support the File constructor (yes, really), so it comes here
			// It works fine with the original file, for which webkitRelativePath is set correctly,
			// but on upload the absolute file path on disk is used
			return file;
		}
	};
	
	const form = new FormData();
	form.append("project", projectName);
	for (const file of files.map(fixFilePath)) {
		form.append("files", file);
	}
	
	return Fetch.fetchJson<Submission>(`/api/submission/course/${courseId}`, {
		method: "POST",
		body: form
		// Don't set the Content-Type header, it is automatically done by using FormData
		// and it breaks if you set it manually, as the boundaries will not be added
	});
};
export const deleteSubmission = (submissionID: string) => {
	return Fetch.fetchJson<Submission>(`/api/submission/${submissionID}`, {"method": "DELETE"});
};

// Files
export const getFiles = (submissionID: string) => {
	return Fetch.fetchJson<APIFile[]>(`/api/file/submission/${submissionID}`);
};
export const getFile = (fileId: string) => {
	return Fetch.fetchJson<APIFile>(`/api/file/${fileId}`);
};
export const getFileContents = (fileId: string) => {
	return Fetch.fetchString(getFileUrl(fileId));
};
export const getFileUrl = (fileID: string) => {
	return `/api/file/${fileID}/body`;
};

// Comments
export const getUserComments = (userId: string) => {
	return Fetch.fetchJson<Comment[]>(`/api/comment/user/${userId}`);
};
export const getCourseUserComments = (courseId: string, userId: string) => {
	return Fetch.fetchJson<Comment[]>(`/api/comment/course/${courseId}/user/${userId}`);
};
export const createComment = (commentThreadID: string, comment: string) => {
	return Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}`, putJson({comment}));
};
export const editComment = (commentThreadID: string, commentID: string, comment: string) => {
	return Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}/${commentID}`, putJson({comment}));
};
export const deleteComment = (commentThreadID: string, commentID: string) => {
	return Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}/${commentID}`, {method: "DELETE"});
};

// CommentThreads
export const getFileComments = (fileID: string) => {
	return Fetch.fetchJson<CommentThread[]>(`/api/commentThread/file/${fileID}`);
};
export const getProjectComments = (submissionID: string) => {
	return Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}`);
};
export const getRecentComments = (submissionID: string) => {
	return Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}/recent`);
};
export const setCommentThreadVisibility = (commentThreadID: string, visibility: ThreadState) => {
	return Fetch.fetchJson<CommentThread>(
		`/api/commentThread/${commentThreadID}`,
		putJson({visibility})
	);
};
export const deleteCommentThread = (commentThreadID: string) => {
	return Fetch.fetchJson<CommentThread>(`/api/commentThread/${commentThreadID}`, {method: "DELETE"});
};
export const createFileCommentThread = (fileID: string, thread: CreateCommentThread) => {
	return Fetch.fetchJson<CommentThread>(`/api/commentThread/file/${fileID}`, postJson(thread));
};
export const createSubmissionCommentThread = (submissionID: string, thread: CreateCommentThread) => {
	return Fetch.fetchJson<CommentThread>(`/api/commentThread/submission/${submissionID}`, postJson(thread));
};

// Mentions
export const getMentions = (pagination?: PaginationParameters) => {
	return Fetch.fetchJson<Mention[]>("/api/mentions" + ParameterHelper.createQueryParameters({...pagination}));
};
export const getCourseMentions = (courseID: string, pagination?: PaginationParameters) => {
	return Fetch.fetchJson<Mention[]>(`/api/mentions/course/${courseID}` + ParameterHelper.createQueryParameters({...pagination}));
};

// Search

export const search = (query: string) => {
	return Fetch.fetchJson<SearchResult>(`/api/search${query}`);
};
export const searchUsers = (query: string, courseID?: string, limit = 20, offset = 0) => {
	// If courseID is not present global users as searched. Permissions in a course/globally might not be set correctly yet by the database
	return Fetch.fetchJson<User[]>("/api/search/users" + ParameterHelper.createQueryParameters({q: query, courseID, limit, offset}));
};

//Tags
export const getMostPopularTags = (limit: number, query= "",  offset = 0) => {
	return  Fetch.fetchJson<Tag[]>("/api/search/tags" + ParameterHelper.createQueryParameters({q: query, limit, offset}));
};

// Auth
export const getLoginProviders = () => {
	return Fetch.fetchJson<LoginProvider[]>("/api/auth/providers");
};

// Permission
export const permission = () => {
	return Fetch.fetchJson<Permission>(`/api/permission`);
};
export const coursePermission = (courseID: string) => {
	return Fetch.fetchJson<Permission>(`/api/permission/course/${courseID}`);
};
export const setPermissionCourse = (courseID: string, userID: string, permissions: Permissions) => {
	return Fetch.fetchJson<CourseUser>(`/api/permission/course/${courseID}/user/${userID}`, putJson({permissions}));
};
export const setPermissionGlobal = (userID: string, permissions: Permissions) => {
	return Fetch.fetchJson<CourseUser>(`/api/permission/user/${userID}`, putJson({permissions}));
};

// Invites
export const getInvite = (inviteID: string) => {
    return Fetch.fetchJson<CourseUser>(`/api/invite/${inviteID}`);
};
export const getInviteLinks = (courseID: string) => {
	return Fetch.fetchJson<Invite>(`/api/invite/course/${courseID}/all`);
};
export const getInviteLink = (courseID: string, role: InviteRole) => {
	return Fetch.fetchJson<CourseInvite>(`/api/invite/course/${courseID}/role/${role}`);
};
export const deleteInviteLink = (courseID: string, role: InviteRole) => {
	return Fetch.fetchJson<Comment>(`/api/invite/course/${courseID}/role/${role}`, {method: "DELETE"});
};

// Role
export const updateGlobalRole = (userID: string, role: GlobalRole) => {
	return Fetch.fetchJson<User>(`/api/role/user/${userID}/${role}`, putJson({}));
};
export const updateCourseRole = (userID: string, courseID: string, role: CourseRole) => {
	return Fetch.fetchJson<CourseUser>(`/api/role/course/${courseID}/user/${userID}/${role}`, putJson({}));
};

// Plugins
export const getPlugins = () => {
	return Fetch.fetchJson<Plugin[]>("/api/plugin");
};
export const createPlugin = (plugin: Partial<Plugin>) => {
	return Fetch.fetchJson<Plugin>("/api/plugin", postJson(plugin));
};
export const updatePlugin = (plugin: Partial<Plugin> & {pluginID: string}) => {
	return Fetch.fetchJson<Plugin>(`/api/plugin/${plugin.pluginID}`, putJson(plugin));
};
export const deletePlugin = (pluginID: string) => {
	return Fetch.fetchJson<User>(`/api/plugin/${pluginID}`, {method: "DELETE"});
};

// Feeds
export const getPersonalFeed = (pagination?: PaginationParameters) =>
    Fetch.fetchJson<FeedItem[]>("/api/feed/personal" + ParameterHelper.createQueryParameters({...pagination}));

export const getPersonalCourseFeed = (courseID: string, pagination?: PaginationParameters) =>
    Fetch.fetchJson<FeedItem[]>(`/api/feed/course/${courseID}/personal` + ParameterHelper.createQueryParameters({...pagination}));

export const getCourseFeed = (courseID: string, pagination?: PaginationParameters) =>
    Fetch.fetchJson<FeedItem[]>(`/api/feed/course/${courseID}` + ParameterHelper.createQueryParameters({...pagination}));
