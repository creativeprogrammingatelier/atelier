import 'mocha';
import {assert, expect} from "chai";

import {issueToken} from "../../api/src/helpers/AuthenticationHelper";
import {User} from "../../models/api/User";
import {
    instanceOfComment,
    instanceOfCommentThread,
    instanceOfCoursePartial,
    instanceOfCourseUser,
    instanceOfInvite,
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
    adminCoursesToUnregister,
    adminRegisterCourse,
    adminSetPermissions,
    adminSetRoleCourse,
    adminSetRoleGlobal,
    adminUnregisterCourse,
    COURSE_ID,
    createCourse,
    DEFAULT_PERMISSIONS,
    deleteCourse,
    deleteInviteStudent,
    deleteInviteTA,
    deleteInviteTeacher,
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
    getInvitesByUserAndCourse,
    getInviteStudent,
    getInviteTA,
    getInviteTeacher,
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
    randomString,
    registerUserCourse,
    setAPITestUserValues,
    setCommentThreadPrivate,
    setCommentThreadPublic,
    setCourseRole,
    setGlobalRole,
    setPermissionsCourse,
    setPermissionsGlobal,
    unregisterUserCourse,
    updateCourse,
    updateUserEmail,
    updateUserName,
    USER_ID
} from "./APIRequestHelper";
import {courseState} from "../../models/enums/courseStateEnum";
import {
    containsPermission,
    managePermissions,
    PermissionEnum,
    viewPermissions
} from "../../models/enums/permissionEnum";
import {getEnum} from "../../models/enums/enumHelper";
import {courseRole} from "../../models/enums/courseRoleEnum";
import {globalRole} from "../../models/enums/globalRoleEnum";

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
    });

    /**
     * Reset user permissions & course registrations before each test.
     * If a single test fails, permissions are not set back automatically in the test.
     * Thus they are reset before each test so that future tests do not fail.
     */
    beforeEach(async() => {
        await removeAllPermissions();
        await removeAllRegistrations();
        await setDefaultRoles();
    });

    async function removeAllPermissions() {
        await adminSetPermissions({
            "manageUserPermissionsView" : false,
            "manageUserPermissionsManager" : false,
            "manageUserRole" : false,
            "viewAllUserProfiles" : false,
            "manageUserRegistration" : false,
            "viewAllCourses" : false,
            "addCourses" : false,
            "manageCourses" : false,
            "addAssignments" : false,
            "manageAssignments" : false,
            "viewAllSubmissions" : false,
            "viewRestrictedComments" : false,
            "addRestrictedComments" : false,
            "manageRestrictedComments" : false,
            "mentionAllStudents" : false,
            "mentionAllAssistants" : false,
            "mentionAllTeachers" : false,
            "mentionNoLimit" : false
        });
    }

    async function removeAllRegistrations() {
        const response = await adminCoursesToUnregister();
        for (let i = 0; i < response.body.length; i++) {
            const course : CoursePartial = response.body[i];
            assert(instanceOfCoursePartial(course));
            await adminUnregisterCourse(course.ID);
        }
    }

    async function setDefaultRoles() {
        await adminSetRoleCourse();
        await adminSetRoleGlobal()
    }

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

        response = await adminCoursesToUnregister();
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
            // User can access a specific comment thread with permission
            let response = await getCommentThread();
            expect(response).to.have.status(200);
            assert(instanceOfCommentThread(response.body));

            // User can access comment threads of a file with permission
            response = await getCommentThreadByFile();
            expect(response).to.have.status(200);
            assert(response.body.every((commentThread: CommentThread) =>
                instanceOfCommentThread(commentThread) &&
                threadStates.includes(commentThread.visibility)
            ));

            // User can access comment threads of a submission with permission
            response = await getCommentThreadBySubmission();
            expect(response).to.have.status(200);
            assert(response.body.every((commentThread: CommentThread) =>
                instanceOfCommentThread(commentThread) &&
                threadStates.includes(commentThread.visibility)
            ));

            // User can access recent comment threads of a submission with permission
            response = await getCommentThreadBySubmissionRecent();
            expect(response).to.have.status(200);
            assert(response.body.every((commentThread: CommentThread) =>
                instanceOfCommentThread(commentThread) &&
                threadStates.includes(commentThread.visibility)
            ));
        }

        async function commentThreadsNoPermissions() {
            // User cannot get a comment thread without permission
            let response = await getCommentThread();
            expect(response).to.have.status(401);

            // User cannot get comment threads of a file without permission
            response = await getCommentThreadByFile();
            expect(response).to.have.status(401);

            // User cannot get comment threads of a submission without permission
            response = await getCommentThreadBySubmission();
            expect(response).to.have.status(401);

            // User cannot get recent comment threads of a submission without permission
            response = await getCommentThreadBySubmissionRecent();
            expect(response).to.have.status(401);
        }

        it("Should not be possible to view comment threads without permission.", async () => {
            await commentThreadsNoPermissions();
        });

        it("Should be possible to view comment threads if registered in the course.", async () => {
            await adminRegisterCourse();
            await commentThreadsPermissions();
            await adminUnregisterCourse();
        });

        it("Should be possible to view comment threads with 'viewAllCourses' permission.", async () => {
            await adminSetPermissions({"viewAllCourses": true});
            await commentThreadsPermissions();
            await adminSetPermissions({"viewAllCourses": false});
        });

        it("Should not be possible to set visibility without permission.", async() => {
            let response = await setCommentThreadPrivate();
            expect(response).to.have.status(401);

            response = await setCommentThreadPublic();
            expect(response).to.have.status(401);
        });

        it("Should be possible to set visibility with permission", async() => {
            await adminSetPermissions({"manageRestrictedComments" : true});

            // Change comment thread to private
            let response = await setCommentThreadPrivate();
            expect(response).to.have.status(200);
            expect(instanceOfCommentThread(response.body));
            expect(response.body.visibility === "private");

            // Change comment thread to public
            response = await setCommentThreadPublic();
            expect(response).to.have.status(200);
            expect(instanceOfCommentThread(response.body));
            expect(response.body.visibility === "public");

            await adminSetPermissions({"manageRestrictedComments" : false});
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
            // User can view a course if enrolled
            let response = await getCourse();
            expect(response).to.have.status(200);
            assert(instanceOfCoursePartial(response.body));

            // User can get own courses
            response = await getCourses();
            expect(response).to.have.status(200);
            expect(response.body.every((course: CoursePartial) => instanceOfCoursePartial(course)));

            // User can get own courses
            response = await getCoursesByOwnUser();
            expect(response).to.have.status(200);
            expect(response.body.every((course: CoursePartial) => instanceOfCoursePartial(course)));

            // User can get other users courses with permission only.
            response = await getCoursesByOtherUser();
            if (onlyEnrolled) {
                expect(response).to.have.status(401);
            } else {
                expect(response).to.have.status(200);
                expect(response.body.every((course: CoursePartial) => instanceOfCoursePartial(course)));
            }
        }

        async function courseNoPermissions() {
            // User cannot get course if without permission
            let response = await getCourse();
            expect(response).to.have.status(401);

            // User can enrolled courses without permission
            response = await getCourses();
            expect(response).to.have.status(200);
            expect(response.body.length).to.equal(0);

            // User can get own courses without permission
            response = await getCoursesByOwnUser();
            expect(response).to.have.status(200);
            expect(response.body.length).to.equal(0);

            // User cannot get other users courses without permission
            response = await getCoursesByOtherUser();
            expect(response).to.have.status(401);
        }

        it("Should not be possible to view courses without enrollments/permissions", async () => {
            await courseNoPermissions();
        });

        it("Should be possible to view courses if registered in a course", async () => {
            await adminRegisterCourse();
            await coursePermissions(true);
            await adminUnregisterCourse();
        });

        it("Should be possible to view courses with 'viewAllCourses' permission.", async () => {
            await adminSetPermissions({"viewAllCourses": true});
            await coursePermissions();
            await adminSetPermissions({"viewAllCourses": false});
        });

        it("Should not be possible to create a course without permission.", async() => {
            const response = await createCourse("Test course", courseState.open);
            expect(response).to.have.status(401);
        });

        it("Should be possible to create a course with permission, and have user be enrolled.", async() => {
            await adminSetPermissions({"addCourses" : true});

            // Create course
            let response = await createCourse("Test course", courseState.open);
            expect(response).to.have.status(200);
            assert(instanceOfCoursePartial(response.body));
            expect(response.body.state).to.equal(courseState.open);
            expect(response.body.name).to.equal("Test course");
            createdCourseID = response.body.ID;

            // User is enrolled
            response = await getCourses();
            expect(response).to.have.status(200);
            assert(response.body.every((course : CoursePartial) => instanceOfCoursePartial(course)));

            const courses : CoursePartial[] = response.body;
            assert(courses.some((course : CoursePartial) => course.ID === createdCourseID));

            await adminSetPermissions({"addCourses" : false});
        });

        it("Should not be possible to set name / state of a course without permission", async() => {
            assert(createdCourseID !== undefined);
            const response = await updateCourse(createdCourseID!, {name : "Test course 2", state : courseState.hidden});
            expect(response).to.have.status(401);
        });

        it("Should be possible to set name / state of a course with permission.", async() => {
            await adminSetPermissions({"manageCourses" : true});

            // Update course name / state
            const response = await updateCourse(createdCourseID!, {name : "Test course 3", state : courseState.hidden});
            expect(response).to.have.status(200);
            assert(instanceOfCoursePartial(response.body));
            expect(response.body.name).to.equal("Test course 3");
            expect(response.body.state).to.equal(courseState.hidden);

            await adminSetPermissions({"manageCourses" : false});
        });

        it("Should not be possible to remove a user from a course without permission.", async() => {
            assert(createdCourseID !== undefined);
            const response = await registerUserCourse(createdCourseID!, USER_ID);
            expect(response).to.have.status(401);
        });

        it("Should be possible to enroll a user in a course with permission, and unregister.", async() => {
            await adminSetPermissions({"manageUserRegistration" : true});

            // Enroll user ins course
            assert(createdCourseID !== undefined);
            let response = await registerUserCourse(createdCourseID!, USER_ID);
            expect(response).to.have.status(200);
            assert(instanceOfCourseUser(response.body));

            // Unregister user from course
            response = await unregisterUserCourse(createdCourseID!, USER_ID);
            expect(response).to.have.status(200);
            assert(instanceOfCourseUser(response.body));

            await unregisterUserCourse(createdCourseID!, USER_ID);
            await adminSetPermissions({"manageUserRegistration" : false});
        });

        it("Should not be possible to delete a course without permission", async() => {
            assert(createdCourseID !== undefined);
            const response = await deleteCourse(createdCourseID!);
            expect(response).to.have.status(401);
        });

        it("Should be possible to delete a course with permission.", async() => {
            await adminSetPermissions({"manageCourses" : true});

            assert(createdCourseID !== undefined);
            const response = await deleteCourse(createdCourseID!);
            expect(response).to.have.status(200);
            assert(instanceOfCoursePartial(response.body));

            await adminSetPermissions({"manageCourses" : false});
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
        async function checkInviteEmpty() {
            const response = await getInvitesByUserAndCourse();

            expect(response.body.student).to.equal(undefined);
            expect(response.body.TA).to.equal(undefined);
            expect(response.body.teacher).to.equal(undefined);
        }

        it("Should not be possible to request all invite links without permission", async() => {
            const response = await getInvitesByUserAndCourse();
            expect(response).to.have.status(401);
        });

        it("Should not be possible to request a specific invite link without permission", async() => {
            // User cannot create a student invite link without permission
            let response = await getInviteStudent();
            expect(response).to.have.status(401);

            // User cannot create a TA invite link without permission
            response = await getInviteTA();
            expect(response).to.have.status(401);

            // User cannot create a teacher invite link without permission
            response = await getInviteTeacher();
            expect(response).to.have.status(401);
        });

        it("Should have no links at the start.", async() => {
            await deleteInviteStudent();
            await deleteInviteTA();
            await deleteInviteTeacher();

            await setPermissionsGlobal({"manageUserRegistration" : true});
            await checkInviteEmpty();
            await setPermissionsGlobal({"manageUserRegistration" : false});
        });

        it("Should be possible to create and receive links.", async() => {
            await adminSetPermissions({"manageUserRegistration" : true});

            // User can create a student invite link with permission
            let response = await getInviteStudent();
            expect(response).to.have.status(200);
            assert(instanceOfInvite(response.body));
            const studentInviteID : string = response.body.inviteID;

            // User can create a TA invite link with permission
            response = await getInviteTA();
            expect(response).to.have.status(200);
            assert(instanceOfInvite(response.body));
            const taInviteID : string = response.body.inviteID;

            // User can create a teacher invite link with permission
            response = await getInviteTeacher();
            expect(response).to.have.status(200);
            assert(instanceOfInvite(response.body));
            const teacherInviteID : string = response.body.inviteID;

            // Check that invite links exist now
            response = await getInvitesByUserAndCourse();
            expect(response).to.have.status(200);
            expect(response.body.student).to.equal(studentInviteID);
            expect(response.body.TA).to.equal(taInviteID);
            expect(response.body.teacher).to.equal(teacherInviteID);

            await adminSetPermissions({"manageUserRegistration" : false});
        });

        it("Should be possible to delete links.", async() => {
            await adminSetPermissions({"manageUserRegistration" : true});

            let response = await getInvitesByUserAndCourse();
            expect(response).to.have.status(200);

            const studentInviteID : string = response.body.student;
            const taInviteID : string = response.body.TA;
            const teacherInviteID : string = response.body.teacher;

            // User can delete a student invite link
            response = await deleteInviteStudent();
            expect(response).to.have.status(200);
            assert(instanceOfInvite(response.body[0]));
            expect(response.body[0].inviteID).to.equal(studentInviteID);

            // User can delete a TA invite link
            response = await deleteInviteTA();
            expect(response).to.have.status(200);
            assert(instanceOfInvite(response.body[0]));
            expect(response.body[0].inviteID).to.equal(taInviteID);

            // User can delete a teacher invite link
            response = await deleteInviteTeacher();
            expect(response).to.have.status(200);
            assert(instanceOfInvite(response.body[0]));
            expect(response.body[0].inviteID).to.equal(teacherInviteID);

            await checkInviteEmpty();

            await adminSetPermissions({"manageUserRegistration" : false});
        });
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
        function setManagePermissions(course : boolean, state : boolean) {
            const permissions = {
                "manageUserPermissionsManager" : state,
                "manageUserPermissionsView" : state,
                "manageUserRole" : state,
                "manageUserRegistration" : state,
                "addCourses" : state,
                "manageCourses" : state,
                "addAssignments" : state,
                "manageAssignments" : state,
                "addRestrictedComments" : state,
                "manageRestrictedComments" : state,
                "mentionAllStudents" : state,
                "mentionAllAssistants" : state,
                "mentionAllTeachers" : state,
                "mentionNoLimit" : state
            };
            return course ?
                setPermissionsCourse(permissions)
                :
                setPermissionsGlobal(permissions);
        }

        function setViewPermissions(course : boolean, state : boolean) {
            const permissions = {
                "viewAllUserProfiles" : state,
                "viewAllCourses" : state,
                "viewAllSubmissions" : state,
                "viewRestrictedComments" : state
            };
            return course ?
                setPermissionsCourse(permissions)
                :
                setPermissionsGlobal(permissions);
        }

        async function setAllPermissions(course : boolean, state : boolean) {
            await setViewPermissions(course, state);
            return setManagePermissions(course, state);
        }

        it("Should be possible to get own global permissions", async() => {
           const response = await getPermission();
           expect(response).to.have.status(200);
           assert(instanceOfPermission(response.body));
        });

        it("Should be possible to get course permissions if enrolled", async() => {
            await adminRegisterCourse();

            const response = await getPermissionByCourse();
            expect(response).to.have.status(200);
            assert(instanceOfPermission(response.body));

            await adminUnregisterCourse();
        });

        it("Should no permissions to a course if not enrolled", async() => {
            const response = await getPermissionByCourse();
            expect(response).to.have.status(200);
            assert(instanceOfPermission(response.body));
            expect(response.body.permissions).to.equal(DEFAULT_PERMISSIONS);
        });

        it("Should not be possible to update global user permissions without permission.", async() => {
            const response = await setAllPermissions(false, true);
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));
            expect(response.body.permission.permissions).to.equal(DEFAULT_PERMISSIONS);
        });

        it("Should not be possible to set course permissions without being enrolled.", async() => {
            const response = await setAllPermissions(true, false);
            expect(response).to.have.status(404);
        });

        it("Should not be possible to update course user permissions without permission", async() => {
            await adminRegisterCourse();

            const response = await setAllPermissions(true, true);
            expect(response).to.have.status(200);
            assert(instanceOfCourseUser(response.body));
            expect(response.body.permission.permissions).to.equal(DEFAULT_PERMISSIONS);
        });

        it("Should be possible to update view user permissions permission", async() => {
            await adminSetPermissions({"manageUserPermissionsView" : true});

            const response = await setAllPermissions(false, true);
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));

            // Views permissions should be set with manage view permission
            viewPermissions.forEach(permission => {
                const bit = getEnum(PermissionEnum, permission.name);
                assert(containsPermission(bit, response.body.permission.permissions));
            });

            // Manage permissions should not be set with manage view permissions
            managePermissions.forEach(permission => {
                const bit = getEnum(PermissionEnum, permission.name);
                if (bit !== PermissionEnum.manageUserPermissionsView) {
                    assert(!containsPermission(bit, response.body.permission.permissions));
                }
            });

            await adminSetPermissions({"manageUserPermissionsView" : false});
        });

        it("Should be possible to update manage user permissions globally with permission.", async() => {
            await adminSetPermissions({"manageUserPermissionsManager" : true});

            const response = await setAllPermissions(false, true);
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));

            // View permissions should not be set with manage permissions permission
            viewPermissions.forEach(permission => {
                const bit = getEnum(PermissionEnum, permission.name);
                assert(!containsPermission(bit, response.body.permission.permissions));
            });

            // Manage permissions should be set with manage permissions permission
            managePermissions.forEach(permission => {
                const bit = getEnum(PermissionEnum, permission.name);
                assert(containsPermission(bit, response.body.permission.permissions));
            });

            await adminSetPermissions({"manageUserPermissionsManager" : false});
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
           let response = await setCourseRole(courseRole.TA);
           expect(response).to.have.status(401);

           response = await setGlobalRole(globalRole.staff);
           expect(response).to.have.status(401);
       });

       it("Should be possible to set global role with permission.", async() => {
           await adminSetPermissions({"manageUserRole" : true});

           let response = await setGlobalRole(globalRole.admin);
           expect(response).to.have.status(200);
           assert(instanceOfUser(response.body));
           expect(response.body.permission.globalRole).to.equal(globalRole.admin);

           response = await setGlobalRole(globalRole.user);
           expect(response).to.have.status(200);
           assert(instanceOfUser(response.body));
           expect(response.body.permission.globalRole).to.equal(globalRole.user);

           await adminSetPermissions({"manageUserRole" : false});
       });

       it("Should be possible to set course role with permission.", async() => {
           await adminRegisterCourse();
           await adminSetPermissions({"manageUserRole" : true});

           let response = await setCourseRole(courseRole.TA);
           expect(response).to.have.status(200);
           assert(instanceOfCourseUser(response.body));
           expect(response.body.permission.courseRole).to.equal(courseRole.TA);

           response = await setCourseRole(courseRole.student);
           expect(response).to.have.status(200);
           assert(instanceOfCourseUser(response.body));
           expect(response.body.permission.courseRole).to.equal(courseRole.student);

           await adminSetPermissions({"manageUserRole" : false});
           await adminUnregisterCourse();
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
            // User can get a submission if enrolled in a course
            let response = await getSubmission();
            expect(response).to.have.status(200);
            assert(instanceOfSubmission(response.body));

            // User can get submissions with permission
            response = await getSubmissionsByCourse();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            // User can get own submissions in a course if registered
            response = await getSubmissionsByOwnCourseUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            // User can get own submissions in a course if registered
            response = await getSubmissionsByOwnUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));

            // User can only get other users submissions with permission
            response = await getSubmissionsByOtherUser();
            if (onlyEnrolled) {
                expect(response).to.have.status(401);
            } else {
                expect(response).to.have.status(200);
                assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));
            }

            // User can only get other users submission with permission
            response = await getSubmissionsByOtherCourseUser();
            if (onlyEnrolled) {
                expect(response).to.have.status(401);
            } else {
                expect(response).to.have.status(200);
                assert(response.body.every((submission : Submission) => instanceOfSubmission(submission)));
            }
        }

        it("Should not be possible to view submissions if no permission.", async() => {
            // User cannot get a submission without permission
            let response = await getSubmission();
            expect(response).to.have.status(401);

            // User cannot get submissions in a course without permission
            response = await getSubmissionsByCourse();
            expect(response).to.have.status(401);

            // User cannot get own submissions in a course without being enrolled
            response = await getSubmissionsByOwnCourseUser();
            expect(response).to.have.status(401);

            // User cannot get other users submission in a course without permission
            response = await getSubmissionsByOtherCourseUser();
            expect(response).to.have.status(401);

            // User cannot get other users submission in a course without permission
            response = await getSubmissionsByOtherUser();
            expect(response).to.have.status(401);
        });

        it("Should be possible to view own submissions in enrolled course. Not of others without permission.", async() => {
            await adminRegisterCourse();

            await submissionPermissions(true);

            await adminUnregisterCourse();
        });

        it("Should be possible to view all submissions in a course with permission", async() => {
            await adminRegisterCourse();
            await adminSetPermissions({"viewAllSubmissions" : true});

            await submissionPermissions();

            await adminSetPermissions({"viewAllSubmissions" : false});
            await adminUnregisterCourse();
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
            await adminSetPermissions({"viewAllUserProfiles" : true});

            const response = await getOtherUser();
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));

            await adminSetPermissions({"viewAllUserProfiles" : false});
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
            await adminSetPermissions({"viewAllUserProfiles" : true});

            const response = await getUsersByCourse();
            expect(response).to.have.status(200);
            assert(response.body.every((user : CourseUser) => instanceOfCourseUser(user)));

            await adminSetPermissions({"viewAllUserProfiles" : false});
        });

        it("Should be possible to get all users with permission to view all user profiles", async() => {
            await adminSetPermissions({"viewAllUserProfiles" : true});

            const response = await getUsers();
            expect(response).to.have.status(200);
            assert(response.body.every((user : User) => instanceOfUser(user)));

            await adminSetPermissions({"viewAllUserProfiles" : false});
        });

        it("Should be possible for a user to update name.", async() => {
            const newName = randomString();
            const response = await updateUserName(newName);
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));
            expect(response.body.name).to.equal(newName);

            await updateUserName("test user");
        });

        it("Should be possible for a user to update email.", async() => {
            const newEmail = randomString();
            const response = await updateUserEmail(newEmail);
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));
            expect(response.body.email).to.equal(newEmail);
        });
    });
});