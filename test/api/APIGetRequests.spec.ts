import 'mocha';
import {app} from "../../api/src/app";
import chai, {expect, assert} from "chai";
import chaiHttp from "chai-http";

import {issueToken} from "../../api/src/helpers/AuthenticationHelper";
import {User} from "../../models/api/User";
import {
    instanceOfCommentThread,
    instanceOfCoursePartial,
    instanceOfPermission,
    instanceOfSubmission,
    instanceOfUser
} from "../InstanceOf";
import {CommentThread} from "../../models/api/CommentThread";
import {CoursePartial} from "../../models/api/Course";
import {Submission} from "../../models/api/Submission";
import {UserDB} from '../../api/src/database/UserDB';

chai.use(chaiHttp);

let USER_ID = "";
/** ID of an admin account to set permissions on the user */
const ADMIN_ID = "AAAAAAAAAAAAAAAAAAAAAA";

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
const getUser = () => chai.request(app)
    .get(`/api/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

const getCommentThread = () => chai.request(app)
    .get(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getCommentThreadByFile = () => chai.request(app)
    .get(`/api/commentThread/file/${FILE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getCommentThreadBySubmission = () => chai.request(app)
    .get(`/api/commentThread/submission/${SUBMISSION_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

const getCourse = () => chai.request(app)
    .get(`/api/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getCourses = () => chai.request(app)
    .get(`/api/course/`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

const getPermission = () => chai.request(app)
    .get(`/api/permission`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getPermissionByCourse = () => chai.request(app)
    .get(`/api/permission/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

const getSubmission = () => chai.request(app)
    .get(`/api/submission/${SUBMISSION_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getSubmissionsByCourse = () => chai.request(app)
    .get(`/api/submission/course/${COURSE_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getSubmissionsByOwnUser = () => chai.request(app)
    .get(`/api/submission/user/${USER_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
const getSubmissionsByOtherUser = () => chai.request(app)
    .get(`/api/submission/user/${ADMIN_ID}`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});

const getUsers = () => chai.request(app)
    .get(`/api/user/all`)
    .set({'Authorization': USER_AUTHORIZATION_KEY});
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
const unregisterCourse = () => chai.request(app)
    .delete(`/api/course/${COURSE_ID}/user/${USER_ID}`)
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY});
const setPermissions = (permissions: any) => chai.request(app)
    .put(`/api/permission/user/${USER_ID}`)
    .send({permissions})
    .set({'Authorization': ADMIN_AUTHORIZATION_KEY, 'Content-Type': 'application/json'});

describe("API permissions", () => {
    before(async () => {
        USER_ID = (await UserDB.filterUser({userName: 'test user', limit: 1}))[0].ID;
        USER_AUTHORIZATION_KEY = issueToken(USER_ID);

        await unregisterCourse();
        await setPermissions({
            "addCourses": false,
            "viewAllCourses": false,
            "viewAllSubmissions": false,
            "viewAllUserProfiles": false
        });
    });

    it("Should have have default permissions at the start of the test", async () => {
        const response = await getUser();
        expect(response).to.have.status(200);

        // Currently default permission is 1. Will probably change later.
        const user: User = response.body;
        assert(instanceOfUser(user));
        expect(user.permission.permissions).to.equal(1);
    });

    describe("Comment threads", () => {
        async function commentThread_200() {
            let response = await getCommentThread();
            expect(response).to.have.status(200);
            assert(instanceOfCommentThread(response.body));

            response = await getCommentThreadByFile();
            expect(response).to.have.status(200);
            assert(response.body.every((commentThread: CommentThread) => instanceOfCommentThread(commentThread)));

            response = await getCommentThreadBySubmission();
            expect(response).to.have.status(200);
            assert(response.body.every((commentThread: CommentThread) => instanceOfCommentThread(commentThread)));
        }

        async function commentThread_401() {
            let response = await getCommentThread();
            expect(response).to.have.status(401);

            response = await getCommentThreadByFile();
            expect(response).to.have.status(401);

            response = await getCommentThreadBySubmission();
            expect(response).to.have.status(401);
        }

        it("Should not view comment thread if not enrolled in the course. No permissions.", async () => {
            await commentThread_401();
        });

        it("Should view comment thread if registered in the course", async () => {
            await registerCourse();
            await commentThread_200();
            await unregisterCourse();
        });

        it("Should view comment thread if permission to view all courses.", async () => {
            await setPermissions({"viewAllCourses": true});
            await commentThread_200();
            await setPermissions({"viewAllCourses": false});
        });
    });

    describe("Courses", () => {
        async function course_200() {
            let response = await getCourses();
            expect(response).to.have.status(200);
            expect(response.body.length).to.greaterThan(0);
            assert(response.body.every((course: CoursePartial) => instanceOfCoursePartial(course)));

            response = await getCourse();
            expect(response).to.have.status(200);
            assert(instanceOfCoursePartial(response.body));
        }

        async function course_401() {
            let response = await getCourses();
            expect(response).to.have.status(200);
            expect(response.body.length).to.equal(0);

            response = await getCourse();
            expect(response).to.have.status(401);
        }

        it("Should not view courses if not enrolled in any. No permission.", async () => {
            await course_401();
        });

        it("Should view courses if registered in a course.", async () => {
            await registerCourse();
            await course_200();
            await unregisterCourse();
        });

        it("Should view courses if permission to view all courses", async () => {
            await setPermissions({"viewAllCourses": true});
            await course_200();
            await setPermissions({"viewAllCourses": false});
        });
    });

    describe("Permissions", () => {
        async function permission_200() {
            const response = await getPermissionByCourse();
            expect(response).to.have.status(200);
            assert(instanceOfPermission(response.body));
        }

        async function permission_401() {
            const response = await getPermissionByCourse();
            expect(response).to.have.status(401);
        }

        it("Should be possible to get own permissions.", async () => {
            const response = await getPermission();
            expect(response).to.have.status(200);
        });

        it("Should be possible to get permissions of user in the course if registered.", async () => {
            await registerCourse();
            await permission_200();
            await unregisterCourse();
        });
    });

    describe("Search", () => {
        // TODO search router
    });

    describe("Submission", () => {
        it("Should not be possible to view submission if not registered. No permissions.", async () => {
            let response = await getSubmission();
            expect(response).to.have.status(401);

            response = await getSubmissionsByCourse();
            expect(response).to.have.status(401);
        });

        it("Should be possible to view submission if registered.", async () => {
            await registerCourse();

            let response = await getSubmission();
            expect(response).to.have.status(200);
            assert(instanceOfSubmission(response.body));

            response = await getSubmissionsByCourse();
            expect(response).to.have.status(200);
            expect(response.body.every((submission: Submission) => (
                instanceOfSubmission(submission) &&
                submission.user.ID === USER_ID)
            ));

            await unregisterCourse();
        });

        it("Should be possible to get own submissions.", async () => {
            const response = await getSubmissionsByOwnUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission: Submission) => instanceOfSubmission(submission)));
        });

        it("Should not be possible to get other users submissions. No permissions.", async () => {
            const response = await getSubmissionsByOtherUser();
            expect(response).to.have.status(401);
        });

        it("Should be possible to get other users submissions with view all submissions permission.", async () => {
            await setPermissions({"viewAllSubmissions": true});

            const response = await getSubmissionsByOtherUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission: Submission) => instanceOfSubmission(submission)));

            await setPermissions({"viewAllSubmissions": false});
        });
    });

    describe("User", () => {
        it("Should be possible to get your own profile.", async () => {
            let response = await getOwnUser1();
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));

            response = await getOwnUser2();
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));
        });

        it("Should not be possible to get other users profile. No permissions.", async () => {
            const response = await getOtherUser();
            expect(response).to.have.status(401);
        });

        it("Should not be possible to get all user profiles. No permissions.", async () => {
            const response = await getUsers();
            expect(response).to.have.status(401);
        });

        it("Should be possible to get other users profile with view all user profiles permission.", async () => {
            await setPermissions({"viewAllUserProfiles": true});

            let response = await getUsers();
            expect(response).to.have.status(200);
            assert(response.body.every((user: User) => instanceOfUser(user)));

            response = await getOtherUser();
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));

            await setPermissions({"viewAllUserProfiles": false});
        });
    });
});
// TODO some filter methods need additional testing. database doesn't contain enough after make to do this yet.
// TODO possibly fix by testing put/post aswell