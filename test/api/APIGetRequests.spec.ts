import 'mocha';
import {assert, expect} from "chai";

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
import {Permissions} from "../../models/api/Permission";
import {CourseUser} from "../../models/database/CourseUser";
import {
    COURSE_ID,
    DEFAULT_PERMISSIONS,
    USER_ID,
    coursesToUnregister,
    createCourse,
    deleteCourse,
    getCommentsByUserAndCourse,
    getCommentsUser,
    getCommentThread,
    getCommentThreadByFile,
    getCommentThreadBySubmission,
    getCommentThreadBySubmissionRecent,
    getCourse,
    getCourses,
    getCoursesByOtherUser,
    getCoursesByOwnUser,
    getOtherUser,
    getOwnUser1,
    getOwnUser2,
    getPermission,
    getPermissionByCourse,
    getSubmission,
    getSubmissionsByCourse,
    getSubmissionsByOtherCourseUser,
    getSubmissionsByOtherUser,
    getSubmissionsByOwnCourseUser,
    getSubmissionsByOwnUser,
    getUsers,
    getUsersByCourse,
    registerCourse,
    registerUserCourse,
    setAPITestUserValues,
    setCommentThreadPrivate,
    setCommentThreadPublic,
    setPermissions,
    unregisterCourse,
    unregisterUserCourse,
    updateCourse
} from "./APIRequestHelper";
import {courseState} from "../../models/enums/courseStateEnum";

let createdCourseID : string | undefined = undefined;

describe("API Tests", () => {
    /**
     * Set user to set user, and receive a token for the API
     * Unregister user from default course, and remove permissions.
     */
    before(async () => {
        // Get test user and set token
        const USER_ID = (await UserDB.filterUser({userName: 'test user', limit: 1}))[0].ID;
        const USER_AUTHORIZATION_KEY = issueToken(USER_ID);
        setAPITestUserValues(USER_ID, USER_AUTHORIZATION_KEY);

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
            "viewAllUserProfiles": false,
            "manageCourses" : false,
            "manageUserRegistration" : false
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
     * GET requests:
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
     * GET requests:
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
     *
     * PUT requests:
     * /api/commentThread/:commentThread
     * - response should be a comment thread
     * - user should be able to update visibility
     * - user should have permission to manage the comment thread
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

        it("Should not be possible to set visibility without permission.", async() => {
            let response = await setCommentThreadPrivate();
            expect(response).to.have.status(401);

            response = await setCommentThreadPublic();
            expect(response).to.have.status(401);
        });

        it("Should be possible to set visibility with permission", async() => {
            await setPermissions({"manageRestrictedComments" : true});

            let response = await setCommentThreadPrivate();
            expect(response).to.have.status(200);
            expect(instanceOfCommentThread(response.body));
            expect(response.body.visibility === "private");

            response = await setCommentThreadPublic();
            expect(response).to.have.status(200);
            expect(instanceOfCommentThread(response.body));
            expect(response.body.visibility === "public");

            await setPermissions({"manageRestrictedComments" : false});
        });
    });

    /**
     * GET requests:
     * /api/course
     * - response should be CoursePartial[]
     * - user should be enrolled or have permission to view all courses.
     * /api/course/user/:courseID
     * - response should be CoursePartial[]
     * - user should be self or have permission to view all courses
     * /api/course/:courseID
     * - response should be CoursePartial
     * - user should be registered in the course or have permission to view all courses
     *
     * PUT requests:
     * /api/course/:courseID
     * - response should be a CoursePartial
     * - user should be able to update a course name
     * - user should be able to update a course state
     * - user should have permission to manage courses
     * /api/course/:courseID/user/:userID
     * - response should be a CourseUser
     * - user should be able to register users in a course
     * - user should have permission to manage user registration
     *
     * DELETE requests:
     * /api/course/:courseID
     * - response should be a CoursePartial
     * - user should be able to delete a course
     * - user should have permission to manage courses
     * /api/course/:courseID/user/:userID
     * - response should be a CourseUser
     * - user should be able to remove a user from a course
     * - user should have permission to manage user registration
     *
     */
    describe("Courses", () => {
        async function coursePermissions(onlyEnrolled = false) {
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
            if (onlyEnrolled) {
                expect(response).to.have.status(401);
            } else {
                expect(response).to.have.status(200);
                expect(response.body.every((course: CoursePartial) => instanceOfCoursePartial(course)));
            }
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
            await coursePermissions(true);
            await unregisterCourse();
        });

        it("Should be possible to view courses with 'viewAllCourses' permission.", async () => {
            await setPermissions({"viewAllCourses": true});
            await coursePermissions();
            await setPermissions({"viewAllCourses": false});
        });

        it("Should not be possible to create a course without permission.", async() => {
            const response = await createCourse("Test Course", courseState.open);
            expect(response).to.have.status(401);
        });

        it("Should be possible to create a course with permission.", async() => {
            await setPermissions({"addCourses" : true});

            const response = await createCourse("Test Course", courseState.open);
            expect(response).to.have.status(200);
            assert(instanceOfCoursePartial(response.body));
            expect(response.body.state).to.equal(courseState.open);
            expect(response.body.name).to.equal("Test Course");
            createdCourseID = response.body.ID;

            await setPermissions({"addCourses" : false});
        });

        it("Should enroll a user after creating a course", async() => {
            const response = await getCourses();
            expect(response).to.have.status(200);
            assert(response.body.every((course : CoursePartial) => instanceOfCoursePartial(course)));

            const courses : CoursePartial[] = response.body;
            assert(courses.some((course : CoursePartial) => course.ID === createdCourseID));
        });

        it("Should not be possible to set name / state of a course without permission", async() => {
            assert(createdCourseID !== undefined);
            const response = await updateCourse(createdCourseID!, {name : "Test Course 2", state : courseState.hidden});
            expect(response).to.have.status(401);
        });

        it("Should be possible to set name / state of a course with permission.", async() => {
            await setPermissions({"manageCourses" : true});

            const response = await updateCourse(createdCourseID!, {name : "Test Course 3", state : courseState.hidden});
            expect(response).to.have.status(200);
            assert(instanceOfCoursePartial(response.body));
            expect(response.body.name).to.equal("Test Course 3");
            expect(response.body.state).to.equal(courseState.hidden);

            await setPermissions({"manageCourses" : false});
        });

        it("Should not be possible to remove a user from a course without permission.", async() => {
            assert(createdCourseID !== undefined);
            const response = await registerUserCourse(createdCourseID!, USER_ID);
            expect(response).to.have.status(401);
        });

        it("Should be possible to remove a user from a course with permission.", async() => {
            await setPermissions({"manageUserRegistration" : true});

            assert(createdCourseID !== undefined);
            const response = await unregisterUserCourse(createdCourseID!, USER_ID);
            expect(response).to.have.status(200);
            assert(instanceOfCourseUser(response.body));

            await setPermissions({"manageUserRegistration" : false});
        });

        it("Should be possible to enroll a user in a course with permission.", async() => {
            await setPermissions({"manageUserRegistration" : true});

            assert(createdCourseID !== undefined);
            const response = await registerUserCourse(createdCourseID!, USER_ID);
            expect(response).to.have.status(200);
            assert(instanceOfCourseUser(response.body));

            await unregisterUserCourse(createdCourseID!, USER_ID);
            await setPermissions({"manageUserRegistration" : false});
        });

        it("Should not be possible to delete a course without permission", async() => {
            assert(createdCourseID !== undefined);
            const response = await deleteCourse(createdCourseID!);
            expect(response).to.have.status(401);
        });

        it("Should be possible to delete a course with permission.", async() => {
            await setPermissions({"manageCourses" : true});

            assert(createdCourseID !== undefined);
            const response = await deleteCourse(createdCourseID!);
            expect(response).to.have.status(200);
            assert(instanceOfCoursePartial(response.body));

            await setPermissions({"manageCourses" : false});
        });
    });

    /**
     * GET requests:
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
     * GET requests:
     * /api/permission
     * - response should be Permission
     * /api/permission/course/:courseID
     * - response should be Permission
     * - should be possible if registered and not registered
     * - should return 0 permissions if not registered
     *
     * PUT requests:
     * /api/permission/course/:courseID/user/:userID
     * - response should be Permission
     * - user can set view permissions with permission to manage view permissions
     * - user can set manage permissions with permission to manage manage permissions
     * /api/permission/user/:userID
     * - response should be Permission
     * - user can set view permissions with permission to manage view permissions
     * - user can set manage permission with permission to manage manage permissions
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

        it("Should not be possible to update global user permissions without permission.", async() => {
            // TODO
        });

        it("Should not be possible to update course user permissions without permission", async() => {
            // TODO
        });

        it("Should be possible to update view user permissions in a course with permission", async() => {
            // TODO
        });

        it("Should be possible to update view user permissions globally with permission", async() => {
            // TODO
        });

        it("Should be possible to update manage user permissions in a course with permission", async() => {
            // TODO
        });

        it("Should be possible to update manage user permissions globally with permission.", async() => {
            // TODO
        });
    });

    /**
     * GET requests:
     */
    describe("Search", () => {
        // TODO test search after finished
    });

    /**
     * PUT requests:
     * /api/role/course/:courseID/user/:userID/:role
     * - response should be CourseUser
     * - user should be able to update a role of a user in a course
     * - user should have permission to manage user permissions
     * /api/role/user/:userID/:role
     * - response should be User
     * - user should be able to update a role of a user globally
     * - user should have permission to manage user permissions
     */
    describe("Role", () => {
       it("Should not be possible to set a role without permission.", async() => {
           // TODO
       });

       it("Should be possible to set global role with permission.", async() => {
           // TODO
       });

       it("Should be possible to set course role with permission.", async() => {
           // TODO
       });
    });

    /**
     * GET requests:
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

        async function submissionPermissions(onlyEnrolled = false) {
            let response = await getSubmission();
            expect(response).to.have.status(200);
            assert(instanceOfSubmission(response.body));

            response = await getSubmissionsByCourse();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            response = await getSubmissionsByOwnCourseUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            response = await getSubmissionsByOwnUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            response = await getSubmissionsByOtherUser();
            if (onlyEnrolled) {
                expect(response).to.have.status(401);
            } else {
                expect(response).to.have.status(200);
                assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));
            }

            response = await getSubmissionsByOtherCourseUser();
            if (onlyEnrolled) {
                expect(response).to.have.status(401);
            } else {
                expect(response).to.have.status(200);
                assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));
            }
        }

        it("Should not be possible to view submissions if no permission.", async() => {
            let response = await getSubmission();
            expect(response).to.have.status(401);

            response = await getSubmissionsByCourse();
            expect(response).to.have.status(401);

            response = await getSubmissionsByOwnCourseUser();
            expect(response).to.have.status(401);

            response = await getSubmissionsByOtherCourseUser();
            expect(response).to.have.status(401);

            response = await getSubmissionsByOtherUser();
            expect(response).to.have.status(401);
        });

        it("Should be possible to view own submissions in enrolled course. Not of others without permission.", async() => {
            await registerCourse();

            await submissionPermissions(true);

            await unregisterCourse();
        });

        it("Should be possible to view all submissions in a course with permission", async() => {
            await registerCourse();
            await setPermissions({"viewAllSubmissions" : true});

            await submissionPermissions();

            await setPermissions({"viewAllSubmissions" : false});
            await unregisterCourse();
        });
    });

    /**
     * GET requests:
     * /api/user/all
     * - response should be User[]
     * /api/user/course/:courseID
     * - response should be CourseUser[]
     * /api/user/:userID
     * - response should be User[]
     * /api/user
     * - response should be User[]
     *
     * PUT requests:
     * /api/user
     * - response should be User
     * - user should be able to set name
     * - user should be able to set email
     */
    describe("Users", () => {

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

        it("Should be possible for a user to update name.", async() => {
            // TODO
        });

        it("Should be possible for a user to update email.", async() => {
            // TODO
        });
    });
});