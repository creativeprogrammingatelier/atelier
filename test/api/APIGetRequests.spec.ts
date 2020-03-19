import 'mocha';
import {app} from "../../api/src/app";
import chai, {assert, expect} from "chai";
import chaiHttp from "chai-http";

import {issueToken} from "../../api/src/helpers/AuthenticationHelper";
import {User} from "../../models/api/User";
import {
    instanceOfComment,
    instanceOfCommentThread,
    instanceOfCoursePartial, instanceOfCourseUser,
    instanceOfPermission,
    instanceOfSubmission,
    instanceOfUser
} from "../InstanceOf";
import {Comment} from "../../models/api/Comment";
import {CommentThread} from "../../models/api/CommentThread";
import {CoursePartial} from "../../models/api/Course";
import {Submission} from "../../models/api/Submission";
import {UserDB} from '../../api/src/database/UserDB';
import {threadState} from "../../models/enums/threadStateEnum";
import {Permission, Permissions} from "../../models/api/Permission";
import {getAllUsers} from "../../client/helpers/APIHelper";
import {CourseUser} from "../../models/database/CourseUser";

chai.use(chaiHttp);

let USER_ID = "";
/** ID of an admin account to set permissions on the user */
const ADMIN_ID = "AAAAAAAAAAAAAAAAAAAAAA";

/** Default permissions used by the database */
const DEFAULT_PERMISSIONS = 1;

/** Default IDs assumed to be in the database */
/** COMMENT_THREAD_ID in FILE_ID in SUBMISSION_ID in COURSE_ID */
const COURSE_ID = "AAAAAAAAAAAAAAAAAAAAAA";
const SUBMISSION_ID = "AAAAAAAAAAAAAAAAAAAAAA";
const FILE_ID = "AAAAAAAAAAAAAAAAAAAAAA";
const COMMENT_THREAD_ID = "AAAAAAAAAAAAAAAAAAAAAA";

/** Authorization keys */
let USER_AUTHORIZATION_KEY: string | undefined = undefined;
const ADMIN_AUTHORIZATION_KEY = issueToken(ADMIN_ID);

/** User requests */
/** Comment requests */
const getCommentsUser = () => chai.request(app)
    .get(`/api/comment/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getCommentsByUserAndCourse = () => chai.request(app)
    .get(`/api/comment/course/${COURSE_ID}/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Comment thread requests */
const getCommentThread = () => chai.request(app)
    .get(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getCommentThreadByFile = () => chai.request(app)
    .get(`/api/commentThread/file/${FILE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getCommentThreadBySubmission = () => chai.request(app)
    .get(`/api/commentThread/submission/${SUBMISSION_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getCommentThreadBySubmissionRecent = () => chai.request(app)
    .get(`/api/commentThread/submission/${SUBMISSION_ID}/recent`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Course requests */
const getCourse = () => chai.request(app)
    .get(`/api/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getCourses = () => chai.request(app)
    .get(`/api/course/`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getCoursesByOwnUser = () => chai.request(app)
    .get(`/api/course/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getCoursesByOtherUser = () => chai.request(app)
    .get(`/api/course/user/${ADMIN_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Invite requests */
const getInvitesByUserAndCourse = () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/all`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getInviteStudent = () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/role/student`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getInviteTA = () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/role/TA`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getInviteTeacher = () => chai.request(app)
    .get(`/api/invite/course/${COURSE_ID}/role/teacher`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getInvite = (INVITE_ID: string) => chai.request(app)
    .get(`/api/invite/${INVITE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Permission requests */
const getPermission = () => chai.request(app)
    .get(`/api/permission`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getPermissionByCourse = () => chai.request(app)
    .get(`/api/permission/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Submission requests */
const getSubmission = () => chai.request(app)
    .get(`/api/submission/${SUBMISSION_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getSubmissionsByCourse = () => chai.request(app)
    .get(`/api/submission/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getSubmissionsByOwnCourseUser = () => chai.request(app)
    .get(`/api/submission/course/${COURSE_ID}/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getSubmissionsByOtherCourseUser = () => chai.request(app)
    .get(`/api/submission/course/${COURSE_ID}/user/${ADMIN_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getSubmissionsByOwnUser = () => chai.request(app)
    .get(`/api/submission/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getSubmissionsByOtherUser = () => chai.request(app)
    .get(`/api/submission/user/${ADMIN_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** User requests */
const getUsers = () => chai.request(app)
    .get(`/api/user/all`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getUsersByCourse = () => chai.request(app)
    .get(`/api/user/course/${COURSE_ID}`)
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
const getOwnUser1 = () => chai.request(app)
    .get(`/api/user`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getOwnUser2 = () => chai.request(app)
    .get(`/api/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getOtherUser = () => chai.request(app)
    .get(`/api/user/${ADMIN_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

/** Admin requests */
const registerCourse = () => chai.request(app)
    .put(`/api/course/${COURSE_ID}/user/${USER_ID}`)
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY});
const unregisterCourse = (course = COURSE_ID) => chai.request(app)
    .delete(`/api/course/${course}/user/${USER_ID}`)
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY});
const coursesToUnregister = () => chai.request(app)
    .get(`/api/course/user/${USER_ID}`)
    .set({'Authorization' : ADMIN_AUTHORIZATION_KEY});
const setPermissions = (permissions: Permissions) => chai.request(app)
    .put(`/api/permission/user/${USER_ID}`)
    .send({permissions})
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY, 'Content-Type': 'application/json'});
const setCommentThreadPrivate = () => chai.request(app)
    .put(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .send({"visibility": "private"})
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY, 'Content-Type': "application/json"});
const setCommentThreadPublic = () => chai.request(app)
    .put(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .send({"visibility": "public"})
    .set({"Authorization": ADMIN_AUTHORIZATION_KEY, "Content-Type": "application/json"});

describe("API Get Permissions", () => {
    /**
     * Set user to set user, and receive a token for the API
     * Unregister user from default course, and remove permissions.
     */
    before(async () => {
        // Get test user and set token
        USER_ID = (await UserDB.filterUser({userName: 'test user', limit: 1}))[0].ID;
        USER_AUTHORIZATION_KEY = issueToken(USER_ID);

        // Unset course registrations and permissions at the start
        const response = await coursesToUnregister();
        await response.body.every((course : CoursePartial) => {
           assert(instanceOfCoursePartial(course));
           unregisterCourse(course.ID);
        });

        await setPermissions({
            "addCourses": false,
            "viewAllCourses": false,
            "viewAllSubmissions": false,
            "viewAllUserProfiles": false
        });
    });

    /**
     * Check permissions of the user at the start of the test. User should not have
     * any permissions.
     */
    it("Should have default permissions at the start of the test", async () => {
        const response = await getOwnUser1();
        expect(response).to.have.status(200);

        const user: User = response.body;
        assert(instanceOfUser(user));
        expect(user.permission.permissions).to.equal(DEFAULT_PERMISSIONS);
    });

    /**
     * Check that user is not registered in any courses prior to the rest of the tests.
     */
    it("Should have no course registrations at the start of the test", async () => {
        let response = await getCourses();
        expect(response).to.have.status(200);
        expect(response.body.length).to.equal(0);

        response = await coursesToUnregister();
        expect(response.body.length).to.equal(0);
    });

    /**
     * /api/comment/user/:userID
     * - response should be Comment[]
     * - comments should belong to userID
     * /api/comment/course/:courseID/user/:userID
     * - response should be Comment[]
     * - comments should belong to userID and courseID
     */
    describe("Comments", async () => {
        it("Should be possible to get user comments", async () => {
            const response = await getCommentsUser();
            expect(response).to.have.status(200);
            assert(response.body.every((comment: Comment) =>
                instanceOfComment(comment &&
                    comment.user.ID === USER_ID
                )));
        });

        it("Should be possible to get user comments in a course", async () => {
            const response = await getCommentsByUserAndCourse();
            expect(response).to.have.status(200);
            assert(response.body.every((comment: Comment) =>
                instanceOfComment(comment) &&
                comment.references.courseID === COURSE_ID &&
                comment.user.ID === USER_ID
            ));
        });
    });

    /**
     * /api/commentThread/:commentThread
     * - response should be CommentThread
     * - user should be enrolled in the course or have permission to view all courses.
     * /api/commentThread/file/:fileID
     * - response should be CommentThread[]
     * - user should be enrolled in the course of have permission to view all courses.
     * - user should have permission to view private comment threads
     * /api/commentThread/submission/:submissionID
     * - response should be CommentThread[]
     * - user should be enrolled in the course of have permission to view all courses.
     * - user should have permission to view private comment threads
     * /api/commentThread/submission/:submissionID/recent
     * - response should be CommentThread[]
     * - user should be enrolled in teh course of have permission to view all courses.
     * - user should have permission to view private comment threads
     */
    describe("Comment threads", () => {
        async function commentThreadsPermissions(threadStates = [threadState.public, threadState.private]) {
            let response = await getCommentThread();
            expect(response).to.have.status(200);
            assert(instanceOfCommentThread(response.body));

            response = await getCommentThreadByFile();
            expect(response).to.have.status(200);
            assert(response.body.every((commentThread: CommentThread) =>
                instanceOfCommentThread(commentThread) &&
                threadStates.includes(commentThread.visibility)
            ));

            response = await getCommentThreadBySubmission();
            expect(response).to.have.status(200);
            assert(response.body.every((commentThread: CommentThread) =>
                instanceOfCommentThread(commentThread) &&
                threadStates.includes(commentThread.visibility)
            ));

            response = await getCommentThreadBySubmissionRecent();
            expect(response).to.have.status(200);
            assert(response.body.every((commentThread: CommentThread) =>
                instanceOfCommentThread(commentThread) &&
                threadStates.includes(commentThread.visibility)
            ));
        }

        async function commentThreadsNoPermissions() {
            let response = await getCommentThread();
            expect(response).to.have.status(401);

            response = await getCommentThreadByFile();
            expect(response).to.have.status(401);

            response = await getCommentThreadBySubmission();
            expect(response).to.have.status(401);

            response = await getCommentThreadBySubmissionRecent();
            expect(response).to.have.status(401);
        }

        it("Should not be possible to view comment threads without permission.", async () => {
            await commentThreadsNoPermissions();
        });

        it("Should be possible to view comment threads if registered in the course.", async () => {
            await registerCourse();
            await commentThreadsPermissions();
            await unregisterCourse();
        });

        it("Should be possible to view comment threads with 'viewAllCourses' permission.", async () => {
            await setPermissions({"viewAllCourses": true});
            await commentThreadsPermissions();
            await setPermissions({"viewAllCourses": false});
        });

        it("Should not be possible to view hidden comment threads without permission", async () => {
            // TODO check default thread to author and comments
            // TODO test should not have a comment to check visibility
        });

        it("Should be possible to view hidden comment threads with permission", async () => {
            // TODO check permission of view restricted comments
            // TODO check visible if user owns a comment
        });
    });

    /**
     * /api/course
     * - response should be CoursePartial[]
     * - user should be enrolled or have permission to view all courses.
     * /api/course/user/:courseID
     * - response should be CoursePartial[]
     * - user should be self or have permission to view all courses
     * /api/course/:courseID
     * - response should be CoursePartial
     * - user should be registered in the course or have permission to view all courses
     */
    describe("Courses", () => {
        async function coursePermissions() {
            let response = await getCourse();
            expect(response).to.have.status(200);
            assert(instanceOfCoursePartial(response.body));

            response = await getCourses();
            expect(response).to.have.status(200);
            expect(response.body.every((course: CoursePartial) => instanceOfCoursePartial(course)));

            response = await getCoursesByOwnUser();
            expect(response).to.have.status(200);
            expect(response.body.every((course: CoursePartial) => instanceOfCoursePartial(course)));

            response = await getCoursesByOtherUser();
            expect(response).to.have.status(200);
            expect(response.body.every((course: CoursePartial) => instanceOfCoursePartial(course)));
        }

        async function courseNoPermissions() {
            let response = await getCourse();
            expect(response).to.have.status(401);

            response = await getCourses();
            expect(response).to.have.status(200);
            expect(response.body.length).to.equal(0);

            response = await getCoursesByOwnUser();
            expect(response).to.have.status(200);
            expect(response.body.length).to.equal(0);

            response = await getCoursesByOtherUser();
            expect(response).to.have.status(401);
        }

        it("Should not be possible to view courses without enrollments/permissions", async () => {
            await courseNoPermissions();
        });

        it("Should be possible to view courses if registered in a course", async () => {
            await registerCourse();
            await coursePermissions();
            await unregisterCourse();
        });

        it("Should be possible to view courses with 'viewAllCourses' permission.", async () => {
            await setPermissions({"viewAllCourses": true});
            await coursePermissions();
            await setPermissions({"viewAllCourses": false});
        });
    });

    /**
     * /api/invite/course/:courseID/all
     * - response should be {student : Invite, TA : Invite, teacher : Invite}
     * - invites should be undefined if no permission to manage user registration
     * - invites should not be undefined if created
     * /api/invite/course/:courseID/role/:role
     * - response should be Invite
     * - requires permission to manage user registration
     * /api/invite/:inviteID
     * - user should be enrolled after request
     * - response should redirect to the course
     */
    describe("Invites", async () => {
        // TODO not invites without permission
        // TODO get invites undefined | Invite
        // TODO create invites
        // TODO invites hidden after creation without permission
        // TODO use links. should redirect.
    });

    /**
     * /api/permission
     * - response should be Permission
     * /api/permission/course/:courseID
     * - response should be Permission
     * - should be possible if registered and not registered
     * - should return 0 permissions if not registered
     */
    describe("Permissions", async() => {
        it("Should be possible to get own global permissions", async() => {
           const response = await getPermission();
           expect(response).to.have.status(200);
           assert(instanceOfPermission(response.body));
        });

        it("Should be possible to get course permissions if enrolled", async() => {
            await registerCourse();

            const response = await getPermissionByCourse();
            expect(response).to.have.status(200);
            assert(instanceOfPermission(response.body));

            await unregisterCourse();
        });

        it("Should no permissions to a course if not enrolled", async() => {
            const response = await getPermissionByCourse();
            expect(response).to.have.status(200);
            assert(instanceOfPermission(response.body));
            expect(response.body.permissions).to.equal(DEFAULT_PERMISSIONS);
        });
    });

    describe("Search", () => {
        // TODO test search after finished
    });

    /**
     * /api/submission/course/:courseID
     * - response should be Submission[]
     * - requires user be to enrolled or have permission to view all courses
     * - should return only owns submissions no permission to view all submissions
     * /api/submission/user/:userID
     * - response should be Submission[]
     * - requires user to be enrolled or have permission to view all courses
     * - requires permission to view all submissions if user is not self
     * /api/submission/course/:courseID/user/:userID
     * - response should be Submission[]
     * - requires user to be enrolled or have permission to view all courses
     * - requires permission to view all submissions is user is not self
     * /api/submission/:submissionID
     * - response should be Submission
     * - requires user to be enrolled or have permission to view all courses
     */
    describe("Submissions", () => {
        // TODO submission tests
        it("Should not be possible to view submissions if no permission.", async() => {
            let response = await getSubmission();
            expect(response).to.have.status(401);

            response = await getSubmissionsByCourse();
            expect(response).to.have.status(401);

            response = await getSubmissionsByOwnCourseUser();
            expect(response).to.have.status(401);

            response = await getSubmissionsByOtherCourseUser();
            expect(response).to.have.status(401);
        });

        it("Should be possible to view own submissions in enrolled course. Not of others without permission.", async() => {
            await registerCourse();

            let response = await getSubmission();
            expect(response).to.have.status(200);
            assert(instanceOfSubmission(response.body));

            response = await getSubmissionsByCourse();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            response = await getSubmissionsByOwnCourseUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            response = await getSubmissionsByOtherCourseUser();
            expect(response).to.have.status(401);

            await unregisterCourse();
        });

        it("Should be possible to view all submissions in a course with permission", async() => {
            await registerCourse();
            await setPermissions({"viewAllSubmissions" : true});

            let response = await getSubmission();
            expect(response).to.have.status(200);
            assert(instanceOfSubmission(response.body));

            response = await getSubmissionsByCourse();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            response = await getSubmissionsByOwnCourseUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            response = await getSubmissionsByOtherCourseUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            await setPermissions({"viewAllSubmissions" : false});
            await unregisterCourse();
        });
    });

    /**
     * /api/user/all
     * - response should be User[]
     * /api/user/course/:courseID
     * - response should be CourseUser[]
     * /api/user/:userID
     * - response should be User[]
     * /api/user
     * - response should be User[]
     */
    describe("Users", () => {
        async function userPermissions() {

        }

        it("Should be possible to get own user profile", async() => {
            let response = await getOwnUser1();
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));

            response = await getOwnUser2();
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));
        });

        it("Should not be possible to get other user profile without permissions", async() => {
            const response = await getOtherUser();
            expect(response).to.have.status(401);
        });

        it("Should be possible to get other user profile with permission.", async() => {
            await setPermissions({"viewAllUserProfiles" : true});

            const response = await getOtherUser();
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));

            await setPermissions({"viewAllUserProfiles" : false});
        });

        it("Should not be possible to get course users without permission to view all user profiles", async() => {
            const response = await getUsersByCourse();
            expect(response).to.have.status(401);
        });

        it("Should not be possible to get all users without permission to view all user profiles", async() => {
            const response = await getUsers();
            expect(response).to.have.status(401);
        });

        it("Should be possible to get all course users with permission to view all user profiles", async() => {
            await setPermissions({"viewAllUserProfiles" : true});

            const response = await getUsersByCourse();
            expect(response).to.have.status(200);
            console.log(response.body);
            console.log(response.body[0]);
            assert(response.body.every((user : CourseUser) => instanceOfCourseUser(user)));

            await setPermissions({"viewAllUserProfiles" : false});
        });

        it("Should be possible to get all users with permission to view all user profiles", async() => {
            await setPermissions({"viewAllUserProfiles" : true});

            const response = await getUsers();
            expect(response).to.have.status(200);
            assert(response.body.every((user : User) => instanceOfUser(user)));

            await setPermissions({"viewAllUserProfiles" : false});
        });
    });
});