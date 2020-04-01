import {issueToken} from "../../api/src/helpers/AuthenticationHelper";
import chai from "chai";
import {app} from "../../api/src/app";
import {Permissions} from "../../models/api/Permission";
import chaiHttp from "chai-http";
import {CourseState} from "../../models/enums/CourseStateEnum";
import {CourseRole} from "../../models/enums/CourseRoleEnum";
import {GlobalRole} from "../../models/enums/GlobalRoleEnum";

chai.use(chaiHttp);

export let USER_ID = "";
/** ID of an admin account to set permissions on the user */
const ADMIN_ID = "AAAAAAAAAAAAAAAAAAAAAA";

/** Default permissions used by the database of user & student */
export const DEFAULT_PERMISSIONS = 1; // TODO: @Jarik: you removed this one, but the tests could not compile without it. It's back for now, you go fix it
export const DEFAULT_GLOBAL_PERMISSIONS = 0;
export const DEFAULT_COURSE_PERMISSIONS = 25769803776;

/** Default IDs assumed to be in the database */
/** COMMENT_THREAD_ID in FILE_ID in SUBMISSION_ID in COURSE_ID */
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

/** User requests */
/** Comment requests */
export const getCommentsUser = () => chai.request(app)
    .get(`/api/comment/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getCommentsByUserAndCourse = () => chai.request(app)
    .get(`/api/comment/course/${COURSE_ID}/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const putComment = ()=> chai.request(app)
    .put(`/api/comment/${COMMENT_THREAD_ID}`)
    .send({comment:"this is a comment used for testing"})
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Comment thread requests */
export const getCommentThread = () => chai.request(app)
    .get(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getCommentThreadByFile = () => chai.request(app)
    .get(`/api/commentThread/file/${FILE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getCommentThreadBySubmission = () => chai.request(app)
    .get(`/api/commentThread/submission/${SUBMISSION_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getCommentThreadBySubmissionRecent = () => chai.request(app)
    .get(`/api/commentThread/submission/${SUBMISSION_ID}/recent`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const setCommentThreadPrivate = () => chai.request(app)
    .put(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .send({"visibility": "private"})
    .set({'Authorization': USER_AUTHORIZATION_KEY, 'Content-Type': "application/json"});
export const setCommentThreadPublic = () => chai.request(app)
    .put(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .send({"visibility": "public"})
    .set({"Authorization": USER_AUTHORIZATION_KEY, "Content-Type": "application/json"});

/** course requests */
export const getCourse = () => chai.request(app)
    .get(`/api/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getCourses = () => chai.request(app)
    .get(`/api/course/`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getCoursesByOwnUser = () => chai.request(app)
    .get(`/api/course/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getCoursesByOtherUser = () => chai.request(app)
    .get(`/api/course/user/${ADMIN_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const createCourse = (name: string, state: CourseState) => chai.request(app)
    .post(`/api/course`)
    .send({"name": name, "state": state})
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const updateCourse = (courseID: string, update: { name?: string, state?: CourseState }) => chai.request(app)
    .put(`/api/course/${courseID}`)
    .send(update)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const deleteCourse = (courseID: string) => chai.request(app)
    .delete(`/api/course/${courseID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const registerUserCourse = (courseID: string, userID: string) => chai.request(app)
    .put(`/api/course/${courseID}/user/${userID}/role/student`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const unregisterUserCourse = (courseID: string, userID: string) => chai.request(app)
    .delete(`/api/course/${courseID}/user/${userID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Invite requests */
export const getInvitesByUserAndCourse = () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/all`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getInviteStudent = () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/role/student`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getInviteTA = () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/role/TA`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getInviteTeacher = () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/role/teacher`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getInvite = (INVITE_ID: string) => chai.request(app)
    .get(`/api/invite/${INVITE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const deleteInviteStudent = () => chai.request(app)
    .delete(`/api/invite/course/${COURSE_ID}/role/student`)
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
export const deleteInviteTA = () => chai.request(app)
    .delete(`/api/invite/course/${COURSE_ID}/role/TA`)
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
export const deleteInviteTeacher = () => chai.request(app)
    .delete(`/api/invite/course/${COURSE_ID}/role/teacher`)
    .set({'Authorization' : USER_AUTHORIZATION_KEY});

/** Permission requests */
export const getPermission = () => chai.request(app)
    .get(`/api/permission`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getPermissionByCourse = () => chai.request(app)
    .get(`/api/permission/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Role requests */
export const setCourseRole = (role : CourseRole) => chai.request(app)
    .put(`/api/role/course/${COURSE_ID}/user/${USER_ID}/${role}`)
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
export const setGlobalRole = (role : GlobalRole) => chai.request(app)
    .put(`/api/role/user/${USER_ID}/${role}`)
    .set({'Authorization' : USER_AUTHORIZATION_KEY});

/** Search requests */
export interface SearchParameters {
    query?: string, 
    courseID?: boolean, 
    userID?: boolean, 
    submissionID?: boolean,
    limit?: number, 
    offset?: number
}
function parseParams({query, courseID, submissionID, userID, limit, offset} : SearchParameters){
    const opts = []
    if (query !== undefined) opts.push(`q=`+encodeURIComponent(query))
    if (courseID) opts.push(`courseID=`+COURSE_ID)
    if (submissionID) opts.push(`submissionID=`+SUBMISSION_ID)
    if (userID) opts.push(`userID=`+USER_ID)
    if (limit !== undefined) opts.push(`limit=`+limit)
    if (offset !== undefined) opts.push(`offset=`+offset)
    return opts.join('&')
}
export const getAllSearch = (params : SearchParameters) => chai.request(app)
    .get("/api/search?"+parseParams(params))
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
export const getCourseSearch = (params : SearchParameters) => chai.request(app)
    .get("/api/search/courses?"+parseParams(params))
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
export const getUserSearch = (params : SearchParameters) => chai.request(app)
    .get("/api/search/users?"+parseParams(params))
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
export const getSubmissionSearch = (params : SearchParameters) => chai.request(app)
    .get("/api/search/submissions?"+parseParams(params))
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
export const getFileSearch = (params : SearchParameters) => chai.request(app)
    .get("/api/search/files?"+parseParams(params))
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
export const getThreadSearch = (params : SearchParameters) => chai.request(app)
    .get("/api/search/comments?"+parseParams(params))
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
export const getSnippetSearch = (params : SearchParameters) => chai.request(app)
    .get("/api/search/snippets?"+parseParams(params))
    .set({'Authorization' : USER_AUTHORIZATION_KEY});

/** Submission requests */
export const getSubmission = () => chai.request(app)
    .get(`/api/submission/${SUBMISSION_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getSubmissionsByCourse = () => chai.request(app)
    .get(`/api/submission/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getSubmissionsByOwnCourseUser = () => chai.request(app)
    .get(`/api/submission/course/${COURSE_ID}/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getSubmissionsByOtherCourseUser = () => chai.request(app)
    .get(`/api/submission/course/${COURSE_ID}/user/${ADMIN_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getSubmissionsByOwnUser = () => chai.request(app)
    .get(`/api/submission/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getSubmissionsByOtherUser = () => chai.request(app)
    .get(`/api/submission/user/${ADMIN_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** User requests */
export const getUsers = () => chai.request(app)
    .get(`/api/user/all`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getUsersByCourse = () => chai.request(app)
    .get(`/api/user/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getOwnUser1 = () => chai.request(app)
    .get(`/api/user`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getOwnUser2 = () => chai.request(app)
    .get(`/api/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getOtherUser = () => chai.request(app)
    .get(`/api/user/${ADMIN_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const updateUserName = (name: string) => chai.request(app)
    .put(`/api/user/`)
    .send({name})
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const updateUserEmail = (email: string) => chai.request(app)
    .put(`/api/user/`)
    .send({email})
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Permissions */
export const setPermissionsGlobal = (permissions : Permissions) => chai.request(app)
    .put(`/api/permission/user/${USER_ID}`)
    .send({permissions})
    .set({'Authorization' : USER_AUTHORIZATION_KEY, 'Content-Type' : 'application/json'});
export const setPermissionsCourse = (permissions : Permissions) => chai.request(app)
    .put(`/api/permission/course/${COURSE_ID}/user/${USER_ID}`)
    .send({permissions})
    .set({'Authorization' : USER_AUTHORIZATION_KEY, 'Content-Type' : 'application/json'});

/** Admin requests */
export const adminRegisterCourse = () => chai.request(app)
    .put(`/api/course/${COURSE_ID}/user/${USER_ID}/role/student`)
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY});
export const adminUnregisterCourse = (course = COURSE_ID) => chai.request(app)
    .delete(`/api/course/${course}/user/${USER_ID}`)
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY});
export const adminCoursesToUnregister = () => chai.request(app)
    .get(`/api/course/user/${USER_ID}`)
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY});
export const adminSetPermissions = (permissions: Permissions) => chai.request(app)
    .put(`/api/permission/user/${USER_ID}`)
    .send({permissions})
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY, 'Content-Type': 'application/json'});
export const adminSetRoleGlobal = () => chai.request(app)
    .put(`/api/role/user/${USER_ID}/user`)
    .set({'Authorization' : ADMIN_AUTHORIZATION_KEY});
export const adminSetRoleCourse = () => chai.request(app)
    .put(`/api/role/course/${COURSE_ID}/user/${USER_ID}/student`)
    .set({'Authorization' : ADMIN_AUTHORIZATION_KEY});

/**
 * Random string generator
 * Has some flaws, but good enough for the use case
 */
export const randomString = () => Math.random().toString(36).substring(7);

