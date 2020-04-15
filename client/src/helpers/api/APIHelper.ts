/** Contains functions to access all API endpoints */

import "../../../../helpers/Extensions";
import {Fetch} from "./FetchHelper";

import {CommentThread, CreateCommentThread} from "../../../../models/api/CommentThread";
import {Course, CoursePartial} from "../../../../models/api/Course";
import {Submission} from "../../../../models/api/Submission";
import {User} from "../../../../models/api/User";
import {Comment} from "../../../../models/api/Comment";
import {File as APIFile} from "../../../../models/api/File";
import {LoginProvider} from "../../../../models/api/LoginProvider";
import {Permission} from "../../../../models/api/Permission";
import {Permissions} from "../../../../models/api/Permission";
import {SearchResult} from "../../../../models/api/SearchResult";
import {Mention} from "../../../../models/api/Mention";
import {CourseInvite, Invite} from "../../../../models/api/Invite";
import {CourseUser} from "../../../../models/api/CourseUser";
import {CourseState} from "../../../../models/enums/CourseStateEnum";
import {Plugin} from "../../../../models/api/Plugin";
import {GlobalRole} from "../../../../models/enums/GlobalRoleEnum";
import {InviteRole} from "../../../../models/enums/InviteRoleEnum";
import {CourseRole} from "../../../../models/enums/CourseRoleEnum";
import {Sorting} from "../../../../models/enums/SortingEnum";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";

// Helpers
const jsonBody = <T>(method: string, body: T) => ({
    method,
    body: JSON.stringify(body),
    headers: {"Content-Type": "application/json"}
});
const postJson = <T>(body: T) => jsonBody("POST", body);
const putJson = <T>(body: T) => jsonBody("PUT", body);

/** Convert a key-value object into a string of query parameters */
function queryParams(params: { [key: string]: string | number | boolean | undefined }) {
    if (!params) return '';
    const items = Object.keys(params)
        .filter(key => params[key] !== undefined)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]!));
    if (items.length > 0) {
        return '?' + items.join('&');
    } else {
        return '';
    }
};

// Courses
export const getCourse = (courseID: string) =>
    Fetch.fetchJson<Course>(`/api/course/${courseID}`);

export const getCourses = () =>
    Fetch.fetchJson<Course[]>("/api/course/");

export const getUserCourses = (userId: string) =>
    Fetch.fetchJson<Course[]>(`/api/course/user/${userId}`);

export const createCourse = (course: { name: string, state: string }) =>
    Fetch.fetchJson<Course>("/api/course", postJson(course));

export const updateCourse = (courseID: string, update: { name?: string, state?: CourseState }) =>
    Fetch.fetchJson<CoursePartial>(`/api/course/${courseID}`, putJson(update));

export const courseEnrollUser = (courseID: string, userID: string, role: CourseRole) =>
    Fetch.fetchJson<CourseUser>(`/api/course/${courseID}/user/${userID}/role/${role}`, putJson({}));

export const courseDisenrollUser = (courseID: string, userID: string) =>
    Fetch.fetchJson<CourseUser>(`/api/course/${courseID}/user/${userID}`, {"method": "DELETE"});

export const deleteCourse = (courseID: string) =>
    Fetch.fetchJson<CoursePartial>(`/api/course/${courseID}`, {"method": "DELETE"});

// Users
export const getCurrentUser = () =>
    Fetch.fetchJson<User>("/api/user/");

export const getUser = (userId: string) =>
    Fetch.fetchJson<User>(`/api/user/${userId}`);

export const getAllUsers = () =>
    Fetch.fetchJson<User[]>(`/api/user/all`);

export const setUser = (body: { name?: string, email?: string }) =>
    Fetch.fetchJson<User>(`/api/user/`, putJson(body));

export const getUsersByCourse = (courseID: string) =>
    Fetch.fetchJson<CourseUser[]>(`/api/user/course/${courseID}`);

// Submissions
export const getCourseSubmissions = (courseId: string) =>
    Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}`);

export const getCourseUserSubmissions = (courseId: string, userId: string) =>
    Fetch.fetchJson<Submission[]>(`/api/submission/course/${courseId}/user/${userId}`);

export const getUserSubmissions = (userId: string) =>
    Fetch.fetchJson<Submission[]>(`/api/submission/user/${userId}`);

export const getSubmission = (submissionID: string) =>
    Fetch.fetchJson<Submission>(`/api/submission/${submissionID}`);

export function createSubmission(courseId: string, projectName: string, files: File[]) {
    const fixFilePath = (file: File) => {
        // Chromium and EdgeHTML will set the formdata filename to webkitRelativePath,
        // but Safari uses the name, so we'll set the name to webkitRelativePath
        try {
            const nf = new File([file], file.webkitRelativePath || file.name, { type: file.type, lastModified: file.lastModified });
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
}

export const deleteSubmission = (submissionID: string) =>
    Fetch.fetchJson<Submission>(`/api/submission/${submissionID}`, {"method": "DELETE"});

// Files
export const getFiles = (submissionID: string) =>
    Fetch.fetchJson<APIFile[]>(`/api/file/submission/${submissionID}`);

export const getFile = (fileId: string) =>
    Fetch.fetchJson<APIFile>(`/api/file/${fileId}`);

export const getFileContents = (fileId: string) =>
    Fetch.fetchString(getFileUrl(fileId));

export const getFileUrl = (fileID: string) =>
    `/api/file/${fileID}/body`;

// Comments
export const getUserComments = (userId: string) =>
    Fetch.fetchJson<Comment[]>(`/api/comment/user/${userId}`);

export const getCourseUserComments = (courseId: string, userId: string) =>
    Fetch.fetchJson<Comment[]>(`/api/comment/course/${courseId}/user/${userId}`);

export const createComment = (commentThreadID: string, comment: string) =>
    Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}`, putJson({comment}));

export const editComment = (commentThreadID: string, commentID: string, comment: string) =>
    Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}/${commentID}`, putJson({comment}));

export const deleteComment = (commentThreadID: string, commentID: string) =>
    Fetch.fetchJson<Comment>(`/api/comment/${commentThreadID}/${commentID}`, {method: "DELETE"});

// CommentThreads
export const getFileComments = (fileID: string) =>
    Fetch.fetchJson<CommentThread[]>(`/api/commentThread/file/${fileID}`);

export const getProjectComments = (submissionID: string) =>
    Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}`);

export const getRecentComments = (submissionID: string) =>
    Fetch.fetchJson<CommentThread[]>(`/api/commentThread/submission/${submissionID}/recent`);

export const setCommentThreadVisibility = (commentThreadID: string, visibility: ThreadState) =>
    Fetch.fetchJson<CommentThread>(
        `/api/commentThread/${commentThreadID}`,
        putJson({visibility})
    );

export const deleteCommentThread = (commentThreadID: string) =>
    Fetch.fetchJson<CommentThread>(`/api/commentThread/${commentThreadID}`, {method: "DELETE"});

export const createFileCommentThread = (fileID: string, thread: CreateCommentThread) =>
    Fetch.fetchJson<CommentThread>(`/api/commentThread/file/${fileID}`, postJson(thread));

export const createSubmissionCommentThread = (submissionID: string, thread: CreateCommentThread) =>
    Fetch.fetchJson<CommentThread>(`/api/commentThread/submission/${submissionID}`, postJson(thread));

// Mentions
export const getMentions = () =>
    Fetch.fetchJson<Mention[]>("/api/mentions");

export const getCourseMentions = (courseID: string) =>
    Fetch.fetchJson<Mention[]>(`/api/mentions/course/${courseID}`);

// Search
interface SearchParameters {
    [key: string]: string | number | Sorting | undefined,
    q: string,
    limit?: number,
    offset?: number,
    sorting?: Sorting,
    courseID?: string,
    userID?: string,
    submissionID?: string
}

export const search = (params: SearchParameters) =>
    Fetch.fetchJson<SearchResult>("/api/search" + queryParams(params));

// If courseID is not present global users as searched. Permissions in a course/globally might not be set correctly yet by the database
export const searchUsers = (query: string, courseID?: string, limit = 20, offset = 0) =>
    Fetch.fetchJson<User[]>("/api/search/users" + queryParams({ q: query, courseID, limit, offset }));

// Auth
export const getLoginProviders = () =>
    Fetch.fetchJson<LoginProvider[]>("/api/auth/providers");

// Permission
export const coursePermission = (courseID: string) =>
    Fetch.fetchJson<Permission>(`/api/permission/course/${courseID}`);

export const permission = () =>
    Fetch.fetchJson<Permission>(`/api/permission`);

export const setPermissionCourse = (courseID: string, userID: string, permissions: Permissions) =>
    Fetch.fetchJson<CourseUser>(`/api/permission/course/${courseID}/user/${userID}`, putJson({permissions}));

export const setPermissionGlobal = (userID: string, permissions: Permissions) =>
    Fetch.fetchJson<CourseUser>(`/api/permission/user/${userID}`, putJson({permissions}));

// Invites
export const getInvites = (courseID: string) =>
    Fetch.fetchJson<Invite>(`/api/invite/course/${courseID}/all`);

export const getInvite = (courseID: string, role: InviteRole) =>
    Fetch.fetchJson<CourseInvite>(`/api/invite/course/${courseID}/role/${role}`);

export const deleteInvite = (courseID: string, role: InviteRole) =>
    Fetch.fetchJson<Comment>(`/api/invite/course/${courseID}/role/${role}`, {method: "DELETE"});

// Role
export const updateGlobalRole = (userID: string, role: GlobalRole) =>
    Fetch.fetchJson<User>(`/api/role/user/${userID}/${role}`, putJson({}));

export const updateCourseRole = (userID: string, courseID: string, role: CourseRole) =>
    Fetch.fetchJson<CourseUser>(`/api/role/course/${courseID}/user/${userID}/${role}`, putJson({}));

// Plugins
export const getPlugins = () =>
    Fetch.fetchJson<Plugin[]>("/api/plugin");

export const createPlugin = (plugin: Partial<Plugin>) =>
    Fetch.fetchJson<Plugin>("/api/plugin", postJson(plugin));

export const updatePlugin = (plugin: Partial<Plugin> & { pluginID: string }) =>
    Fetch.fetchJson<Plugin>(`/api/plugin/${plugin.pluginID}`, putJson(plugin));

export const deletePlugin = (pluginID: string) =>
    Fetch.fetchJson<User>(`/api/plugin/${pluginID}`, {method: "DELETE"});
