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
export const getCourse = async (courseID: string) =>
    Fetch.fetchJson<Course>(`/api/course/${courseID}`);
export const getCourses = async () =>
    Fetch.fetchJson<Course[]>("/api/course/");
export const getUserCourses = async (userId: string) =>
    Fetch.fetchJson<Course[]>(`/api/course/user/${userId}`);
export const createCourse = async (course: {name: string, state: string, canvasCourseId: string}) =>
    Fetch.fetchJson<Course>("/api/course", postJson(course));
export const updateCourse = async (courseID: string, update: {name?: string, state?: CourseState, canvasCourseId?: string}) =>
    Fetch.fetchJson<CoursePartial>(`/api/course/${courseID}`, putJson(update));
export const courseEnrollUser = async (courseID: string, userID: string, role: CourseRole) =>
    Fetch.fetchJson<CourseUser>(`/api/course/${courseID}/user/${userID}/role/${role}`, putJson({}));
export const courseDisenrollUser = async (courseID: string, userID: string) =>
    Fetch.fetchJson<CourseUser>(`/api/course/${courseID}/user/${userID}`, {"method": "DELETE"});
export const deleteCourse = async (courseID: string) =>
    Fetch.fetchJson<CoursePartial>(`/api/course/${courseID}`, {"method": "DELETE"});

// Users
export const getCurrentUser = async () =>
    Fetch.fetchJson<User>("/api/user/");
export const getUser = async (userId: string) =>
    Fetch.fetchJson<User>(`/api/user/${userId}`);
export const getCourseUser = async (userId: string, courseId: string) =>
    Fetch.fetchJson<CourseUser>(`/api/user/${userId}/course/${courseId}`);
export const getAllUsers = async () =>
    Fetch.fetchJson<User[]>("/api/user/all");
export const setUser = async (body: Partial<User>) =>
    Fetch.fetchJson<User>("/api/user/", putJson(body));
export const getUsersByCourse = async (courseID: string) =>
    Fetch.fetchJson<CourseUser[]>(`/api/user/course/${courseID}`);

// Submissions
export const getCourseSubmissions = async (courseId: string, pagination?: PaginationParameters) =>
    Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}` + ParameterHelper.createQueryParameters({...pagination}));
export const getCourseUserSubmissions = async (courseId: string, userId: string, pagination?: PaginationParameters) =>
    Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}/user/${userId}` + ParameterHelper.createQueryParameters({...pagination}));
export const getUserSubmissions = async (userId: string, pagination?: PaginationParameters) =>
    Fetch.fetchJson<Submission[]>(`/api/submission/user/${userId}` + ParameterHelper.createQueryParameters({...pagination}));
export const getSubmission = async (submissionID: string) =>
    Fetch.fetchJson<Submission>(`/api/submission/${submissionID}`);
export const createSubmission = async (courseId: string, projectName: string, files: File[]) => {
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
export const deleteSubmission = async (submissionID: string) =>
    Fetch.fetchJson<Submission>(`/api/submission/${submissionID}`, {"method": "DELETE"});

// Files
export const getFiles = async (submissionID: string) =>
    Fetch.fetchJson<APIFile[]>(`/api/file/submission/${submissionID}`);
export const getFile = async (fileId: string) =>
    Fetch.fetchJson<APIFile>(`/api/file/${fileId}`);
export const getFileContents = async (fileId: string) =>
    Fetch.fetchString(getFileUrl(fileId));
export const getFileUrl = (fileID: string) =>
    `/api/file/${fileID}/body`;

// Comments
export const getUserComments = async (userId: string) =>
    Fetch.fetchJson<Comment[]>(`/api/comment/user/${userId}`);
export const getCourseUserComments = async (courseId: string, userId: string) =>
    Fetch.fetchJson<Comment[]>(`/api/comment/course/${courseId}/user/${userId}`);
export const createComment = async (commentThreadID: string, comment: string) =>
    Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}`, putJson({comment}));
export const editComment = async (commentThreadID: string, commentID: string, comment: string) =>
    Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}/${commentID}`, putJson({comment}));
export const deleteComment = async (commentThreadID: string, commentID: string) =>
    Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}/${commentID}`, {method: "DELETE"});

// CommentThreads
export const getFileComments = async (fileID: string) =>
    Fetch.fetchJson<CommentThread[]>(`/api/commentThread/file/${fileID}`);
export const getProjectComments = async (submissionID: string) =>
    Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}`);
export const getRecentComments = async (submissionID: string) =>
    Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}/recent`);
export const setCommentThreadVisibility = async (commentThreadID: string, visibility: ThreadState) =>
    Fetch.fetchJson<CommentThread>(
        `/api/commentThread/${commentThreadID}`,
        putJson({visibility})
    );
export const deleteCommentThread = async (commentThreadID: string) =>
    Fetch.fetchJson<CommentThread>(`/api/commentThread/${commentThreadID}`, {method: "DELETE"});
export const createFileCommentThread = async (fileID: string, thread: CreateCommentThread) =>
    Fetch.fetchJson<CommentThread>(`/api/commentThread/file/${fileID}`, postJson(thread));
export const createSubmissionCommentThread = async (submissionID: string, thread: CreateCommentThread) =>
    Fetch.fetchJson<CommentThread>(`/api/commentThread/submission/${submissionID}`, postJson(thread));

// Mentions
export const getMentions = async (pagination?: PaginationParameters) =>
    Fetch.fetchJson<Mention[]>("/api/mentions" + ParameterHelper.createQueryParameters({...pagination}));
export const getCourseMentions = async (courseID: string, pagination?: PaginationParameters) =>
    Fetch.fetchJson<Mention[]>(`/api/mentions/course/${courseID}` + ParameterHelper.createQueryParameters({...pagination}));

// Search

export const search = async (query: string) =>
    Fetch.fetchJson<SearchResult>(`/api/search${query}`);
export const searchUsers = async (query: string, courseID?: string, limit = 20, offset = 0) =>
    // If courseID is not present global users as searched. Permissions in a course/globally might not be set correctly yet by the database
    Fetch.fetchJson<User[]>("/api/search/users" + ParameterHelper.createQueryParameters({q: query, courseID, limit, offset}));

//Tags
export const getMostPopularTags = async (limit: number, query= "",  offset = 0) =>
    Fetch.fetchJson<Tag[]>("/api/search/tags" + ParameterHelper.createQueryParameters({q: query, limit, offset}));

// Auth
export const getLoginProviders = async () =>
    Fetch.fetchJson<LoginProvider[]>("/api/auth/providers");

// Permission
export const permission = async () =>
    Fetch.fetchJson<Permission>("/api/permission");
export const coursePermission = async (courseID: string) =>
    Fetch.fetchJson<Permission>(`/api/permission/course/${courseID}`);
export const setPermissionCourse = async (courseID: string, userID: string, permissions: Permissions) =>
    Fetch.fetchJson<CourseUser>(`/api/permission/course/${courseID}/user/${userID}`, putJson({permissions}));
export const setPermissionGlobal = async (userID: string, permissions: Permissions) =>
    Fetch.fetchJson<CourseUser>(`/api/permission/user/${userID}`, putJson({permissions}));

// Invites
export const getInvite = async (inviteID: string) =>
    Fetch.fetchJson<CourseUser>(`/api/invite/${inviteID}`);
export const getInviteLinks = async (courseID: string) =>
    Fetch.fetchJson<Invite>(`/api/invite/course/${courseID}/all`);
export const getInviteLink = async (courseID: string, role: InviteRole) =>
    Fetch.fetchJson<CourseInvite>(`/api/invite/course/${courseID}/role/${role}`);
export const deleteInviteLink = async (courseID: string, role: InviteRole) =>
    Fetch.fetchJson<Comment>(`/api/invite/course/${courseID}/role/${role}`, {method: "DELETE"});

// Role
export const updateGlobalRole = async (userID: string, role: GlobalRole) =>
    Fetch.fetchJson<User>(`/api/role/user/${userID}/${role}`, putJson({}));
export const updateCourseRole = async (userID: string, courseID: string, role: CourseRole) =>
    Fetch.fetchJson<CourseUser>(`/api/role/course/${courseID}/user/${userID}/${role}`, putJson({}));

// Plugins
export const getPlugins = async () =>
    Fetch.fetchJson<Plugin[]>("/api/plugin");
export const createPlugin = async (plugin: Partial<Plugin>) =>
    Fetch.fetchJson<Plugin>("/api/plugin", postJson(plugin));
export const updatePlugin = async (plugin: Partial<Plugin> & {pluginID: string}) =>
    Fetch.fetchJson<Plugin>(`/api/plugin/${plugin.pluginID}`, putJson(plugin));
export const deletePlugin = async (pluginID: string) =>
    Fetch.fetchJson<User>(`/api/plugin/${pluginID}`, {method: "DELETE"});

// Feeds
export const getPersonalFeed = async (pagination?: PaginationParameters) =>
    Fetch.fetchJson<FeedItem[]>("/api/feed/personal" + ParameterHelper.createQueryParameters({...pagination}));

export const getPersonalCourseFeed = async (courseID: string, pagination?: PaginationParameters) =>
    Fetch.fetchJson<FeedItem[]>(`/api/feed/course/${courseID}/personal` + ParameterHelper.createQueryParameters({...pagination}));

export const getCourseFeed = async (courseID: string, pagination?: PaginationParameters) =>
    Fetch.fetchJson<FeedItem[]>(`/api/feed/course/${courseID}` + ParameterHelper.createQueryParameters({...pagination}));
