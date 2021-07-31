import chai from "chai";
import chaiHttp from "chai-http";

import {Permissions} from "../../../models/api/Permission";
import {CourseState} from "../../../models/enums/CourseStateEnum";
import {CourseRole} from "../../../models/enums/CourseRoleEnum";
import {GlobalRole} from "../../../models/enums/GlobalRoleEnum";

import {issueToken} from "../../../api/src/helpers/AuthenticationHelper";
import {app} from "../../../api/src/app";

chai.use(chaiHttp);

export let USER_ID = "";
/** ID of an admin account to set permissions on the user */
const ADMIN_ID = "AAAAAAAAAAAAAAAAAAAAAA";

/** Default permissions used by the database of user & student */
export const DEFAULT_GLOBAL_PERMISSIONS = 0;
export const DEFAULT_COURSE_PERMISSIONS = 25769803776;

/**
 * Default IDs assumed to be in the database
 * COMMENT_THREAD_ID in FILE_ID in SUBMISSION_ID in COURSE_ID
 */
export const COURSE_ID = "AAAAAAAAAAAAAAAAAAAAAA";
export const SUBMISSION_ID = "AAAAAAAAAAAAAAAAAAAAAA";
export const FILE_ID = "AAAAAAAAAAAAAAAAAAAAAA";
export const COMMENT_THREAD_ID = "AAAAAAAAAAAAAAAAAAAAAA";

/** Authorization keys */
let USER_AUTHORIZATION_KEY: string | undefined = undefined;
const ADMIN_AUTHORIZATION_KEY = issueToken(ADMIN_ID);

export function setAPITestUserValues(userID: string, userKey: string) {
    USER_ID = userID;
    USER_AUTHORIZATION_KEY = userKey;
}

/**
 * Random string generator
 * Has some flaws, but good enough for the use case
 */
export const randomString = () => Math.random().toString(36).substring(7);
function parseParams({query, courseID, submissionID, userID, limit, offset}: SearchParameters) {
    const opts = [];
    if (query !== undefined) {
        opts.push("q=" + encodeURIComponent(query));
    }
    if (courseID) {
        opts.push("courseID=" + COURSE_ID);
    }
    if (submissionID) {
        opts.push("submissionID=" + SUBMISSION_ID);
    }
    if (userID) {
        opts.push("userID=" + USER_ID);
    }
    if (limit !== undefined) {
        opts.push("limit=" + limit);
    }
    if (offset !== undefined) {
        opts.push("offset=" + offset);
    }
    return opts.join("&");
}
export interface SearchParameters {
    query?: string,
    courseID?: boolean,
    userID?: boolean,
    submissionID?: boolean,
    limit?: number,
    offset?: number
}

/** Ping to check if live */
export const ping = async () => chai.request(app)
    .get("/ping");

/** Comment requests */
export const getCommentsUser = async () => chai.request(app)
    .get(`/api/comment/user/${USER_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getCommentsByUserAndCourse = async () => chai.request(app)
    .get(`/api/comment/course/${COURSE_ID}/user/${USER_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const putComment = async (comment: string) => chai.request(app)
    .put(`/api/comment/${COMMENT_THREAD_ID}`)
    .send({comment})
    .set({"Authorization": USER_AUTHORIZATION_KEY});

/** Comment thread requests */
export const getCommentThread = async () => chai.request(app)
    .get(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getCommentThreadByFile = async () => chai.request(app)
    .get(`/api/commentThread/file/${FILE_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getCommentThreadBySubmission = async () => chai.request(app)
    .get(`/api/commentThread/submission/${SUBMISSION_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getCommentThreadBySubmissionRecent = async () => chai.request(app)
    .get(`/api/commentThread/submission/${SUBMISSION_ID}/recent`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const setCommentThreadPrivate = async () => chai.request(app)
    .put(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .send({"visibility": "private"})
    .set({"Authorization": USER_AUTHORIZATION_KEY, "Content-Type": "application/json"});
export const setCommentThreadPublic = async () => chai.request(app)
    .put(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .send({"visibility": "public"})
    .set({"Authorization": USER_AUTHORIZATION_KEY, "Content-Type": "application/json"});

/** Course requests */
export const getCourse = async () => chai.request(app)
    .get(`/api/course/${COURSE_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getCourses = async () => chai.request(app)
    .get("/api/course/")
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getCoursesByOwnUser = async () => chai.request(app)
    .get(`/api/course/user/${USER_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getCoursesByOtherUser = async () => chai.request(app)
    .get(`/api/course/user/${ADMIN_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const createCourse = async (name: string, state: CourseState) => chai.request(app)
    .post("/api/course")
    .send({"name": name, "state": state})
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const updateCourse = async (courseID: string, update: {name?: string, state?: CourseState}) => chai.request(app)
    .put(`/api/course/${courseID}`)
    .send(update)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const deleteCourse = async (courseID: string) => chai.request(app)
    .delete(`/api/course/${courseID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const registerUserCourse = async (courseID: string, userID: string) => chai.request(app)
    .put(`/api/course/${courseID}/user/${userID}/role/student`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const unregisterUserCourse = async (courseID: string, userID: string) => chai.request(app)
    .delete(`/api/course/${courseID}/user/${userID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});

/** Invite requests */
export const getInvitesByUserAndCourse = async () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/all`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getInviteStudent = async () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/role/student`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getInviteTA = async () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/role/TA`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getInviteTeacher = async () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/role/teacher`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getInvite = async (INVITE_ID: string) => chai.request(app)
    .get(`/api/invite/${INVITE_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const deleteInviteStudent = async () => chai.request(app)
    .delete(`/api/invite/course/${COURSE_ID}/role/student`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const deleteInviteTA = async () => chai.request(app)
    .delete(`/api/invite/course/${COURSE_ID}/role/TA`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const deleteInviteTeacher = async () => chai.request(app)
    .delete(`/api/invite/course/${COURSE_ID}/role/teacher`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});

/** Permission requests */
export const getPermission = async () => chai.request(app)
    .get("/api/permission")
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getPermissionByCourse = async () => chai.request(app)
    .get(`/api/permission/course/${COURSE_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});

/** Role requests */
export const setCourseRole = async (role: CourseRole) => chai.request(app)
    .put(`/api/role/course/${COURSE_ID}/user/${USER_ID}/${role}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const setGlobalRole = async (role: GlobalRole) => chai.request(app)
    .put(`/api/role/user/${USER_ID}/${role}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});

/** Search requests */

export const getAllSearch = async (params: SearchParameters) => chai.request(app)
    .get("/api/search?" + parseParams(params))
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getCourseSearch = async (params: SearchParameters) => chai.request(app)
    .get("/api/search/courses?" + parseParams(params))
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getUserSearch = async (params: SearchParameters) => chai.request(app)
    .get("/api/search/users?" + parseParams(params))
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getSubmissionSearch = async (params: SearchParameters) => chai.request(app)
    .get("/api/search/submissions?" + parseParams(params))
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getFileSearch = async (params: SearchParameters) => chai.request(app)
    .get("/api/search/files?" + parseParams(params))
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getThreadSearch = async (params: SearchParameters) => chai.request(app)
    .get("/api/search/comments?" + parseParams(params))
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getSnippetSearch = async (params: SearchParameters) => chai.request(app)
    .get("/api/search/snippets?" + parseParams(params))
    .set({"Authorization": USER_AUTHORIZATION_KEY});

/** Submission requests */
export const getSubmission = async () => chai.request(app)
    .get(`/api/submission/${SUBMISSION_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getSubmissionsByCourse = async () => chai.request(app)
    .get(`/api/submission/course/${COURSE_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getSubmissionsByOwnCourseUser = async () => chai.request(app)
    .get(`/api/submission/course/${COURSE_ID}/user/${USER_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getSubmissionsByOtherCourseUser = async () => chai.request(app)
    .get(`/api/submission/course/${COURSE_ID}/user/${ADMIN_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getSubmissionsByOwnUser = async () => chai.request(app)
    .get(`/api/submission/user/${USER_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getSubmissionsByOtherUser = async () => chai.request(app)
    .get(`/api/submission/user/${ADMIN_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});

/** User requests */
export const getUsers = async () => chai.request(app)
    .get("/api/user/all")
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getUsersByCourse = async () => chai.request(app)
    .get(`/api/user/course/${COURSE_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getOwnUser1 = async () => chai.request(app)
    .get("/api/user")
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getOwnUser2 = async () => chai.request(app)
    .get(`/api/user/${USER_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const getOtherUser = async () => chai.request(app)
    .get(`/api/user/${ADMIN_ID}`)
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const updateUserName = async (name: string) => chai.request(app)
    .put("/api/user/")
    .send({name})
    .set({"Authorization": USER_AUTHORIZATION_KEY});
export const updateUserEmail = async (email: string) => chai.request(app)
    .put("/api/user/")
    .send({email})
    .set({"Authorization": USER_AUTHORIZATION_KEY});

/** Permissions */
export const setPermissionsGlobal = async (permissions: Permissions) => chai.request(app)
    .put(`/api/permission/user/${USER_ID}`)
    .send({permissions})
    .set({"Authorization": USER_AUTHORIZATION_KEY, "Content-Type": "application/json"});
export const setPermissionsCourse = async (permissions: Permissions) => chai.request(app)
    .put(`/api/permission/course/${COURSE_ID}/user/${USER_ID}`)
    .send({permissions})
    .set({"Authorization": USER_AUTHORIZATION_KEY, "Content-Type": "application/json"});

/** Admin requests */
export const adminRegisterCourse = async () => chai.request(app)
    .put(`/api/course/${COURSE_ID}/user/${USER_ID}/role/student`)
    .set({"Authorization": ADMIN_AUTHORIZATION_KEY});
export const adminUnregisterCourse = async (course = COURSE_ID) => chai.request(app)
    .delete(`/api/course/${course}/user/${USER_ID}`)
    .set({"Authorization": ADMIN_AUTHORIZATION_KEY});
export const adminCoursesToUnregister = async () => chai.request(app)
    .get(`/api/course/user/${USER_ID}`)
    .set({"Authorization": ADMIN_AUTHORIZATION_KEY});
export const adminSetPermissions = async (permissions: Permissions) => chai.request(app)
    .put(`/api/permission/user/${USER_ID}`)
    .send({permissions})
    .set({"Authorization": ADMIN_AUTHORIZATION_KEY, "Content-Type": "application/json"});
export const adminSetRoleGlobal = async () => chai.request(app)
    .put(`/api/role/user/${USER_ID}/user`)
    .set({"Authorization": ADMIN_AUTHORIZATION_KEY});
export const adminSetRoleCourse = async () => chai.request(app)
    .put(`/api/role/course/${COURSE_ID}/user/${USER_ID}/student`)
    .set({"Authorization": ADMIN_AUTHORIZATION_KEY});

