import {issueToken} from "../../api/src/helpers/AuthenticationHelper";
import chai from "chai";
import {app} from "../../api/src/app";
import {Permissions} from "../../models/api/Permission";
import chaiHttp from "chai-http";

chai.use(chaiHttp);

export let USER_ID = "";
/** ID of an admin account to set permissions on the user */
const ADMIN_ID = "AAAAAAAAAAAAAAAAAAAAAA";

/** Default permissions used by the database */
export const DEFAULT_PERMISSIONS = 1;

/** Default IDs assumed to be in the database */
/** COMMENT_THREAD_ID in FILE_ID in SUBMISSION_ID in COURSE_ID */
export const COURSE_ID = "AAAAAAAAAAAAAAAAAAAAAA";
export const SUBMISSION_ID = "AAAAAAAAAAAAAAAAAAAAAA";
export const FILE_ID = "AAAAAAAAAAAAAAAAAAAAAA";
export const COMMENT_THREAD_ID = "AAAAAAAAAAAAAAAAAAAAAA";

/** Authorization keys */
let USER_AUTHORIZATION_KEY: string | undefined = undefined;
const ADMIN_AUTHORIZATION_KEY = issueToken(ADMIN_ID);

export function setAPITestUserValues(userID : string, userKey : string) {
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

/** Course requests */
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

/** Permission requests */
export const getPermission = () => chai.request(app)
    .get(`/api/permission`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getPermissionByCourse = () => chai.request(app)
    .get(`/api/permission/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

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
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
export const getOwnUser1 = () => chai.request(app)
    .get(`/api/user`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getOwnUser2 = () => chai.request(app)
    .get(`/api/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
export const getOtherUser = () => chai.request(app)
    .get(`/api/user/${ADMIN_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Admin requests */
export const registerCourse = () => chai.request(app)
    .put(`/api/course/${COURSE_ID}/user/${USER_ID}`)
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY});
export const unregisterCourse = (course = COURSE_ID) => chai.request(app)
    .delete(`/api/course/${course}/user/${USER_ID}`)
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY});
export const coursesToUnregister = () => chai.request(app)
    .get(`/api/course/user/${USER_ID}`)
    .set({'Authorization' : ADMIN_AUTHORIZATION_KEY});
export const setPermissions = (permissions: Permissions) => chai.request(app)
    .put(`/api/permission/user/${USER_ID}`)
    .send({permissions})
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY, 'Content-Type': 'application/json'});
export const setCommentThreadPrivate = () => chai.request(app)
    .put(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .send({"visibility": "private"})
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY, 'Content-Type': "application/json"});
export const setCommentThreadPublic = () => chai.request(app)
    .put(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .send({"visibility": "public"})
    .set({"Authorization": ADMIN_AUTHORIZATION_KEY, "Content-Type": "application/json"});