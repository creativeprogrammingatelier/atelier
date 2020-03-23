// import 'mocha';
// import {assert, expect} from "chai";
// import {UserDB} from "../../api/src/database/UserDB";
// import {issueToken} from "../../api/src/helpers/AuthenticationHelper";
// import {
//     coursesToUnregister,
//     createCourse, deleteCourse, getCourses, registerUserCourse,
//     setAPITestUserValues,
//     setCommentThreadPrivate,
//     setCommentThreadPublic,
//     setPermissions, unregisterUserCourse,
//     updateCourse, USER_ID
// } from "./APIRequestHelper";
// import {instanceOfCommentThread, instanceOfCoursePartial, instanceOfCourseUser} from "../InstanceOf";
// import {courseState} from "../../models/enums/courseStateEnum";
// import {CoursePartial} from "../../models/api/Course";
//
// let createdCourseID : string | undefined = undefined;
//
// describe("API Put Permissions", () => {
//
//     before(async () => {
//         // Get test user and set token
//         const USER_ID = (await UserDB.filterUser({userName: 'test user', limit: 1}))[0].ID;
//         const USER_AUTHORIZATION_KEY = issueToken(USER_ID);
//         setAPITestUserValues(USER_ID, USER_AUTHORIZATION_KEY);
//     });
//
//     it("Should not be enrolled in a course at the start", async() => {
//         const response = await coursesToUnregister();
//         expect(response.body.length).to.equal(0);
//     });
//
//
//     /**
//      * /api/commentThread/:commentThreadID
//      * - response should be a CommentThread
//      * - visibility can be set if user owns the thread or has permission to manage restricted comments
//      */
//     describe("Comment threads", () => {
//         it("Should not be possible to set visibility without permission.", async() => {
//             let response = await setCommentThreadPrivate();
//             expect(response).to.have.status(401);
//
//             response = await setCommentThreadPublic();
//             expect(response).to.have.status(401);
//         });
//
//         it("Should be possible to set visibility with permission", async() => {
//             await setPermissions({"manageRestrictedComments" : true});
//
//             let response = await setCommentThreadPrivate();
//             expect(response).to.have.status(200);
//             expect(instanceOfCommentThread(response.body));
//             expect(response.body.visibility === "private");
//
//             response = await setCommentThreadPublic();
//             expect(response).to.have.status(200);
//             expect(instanceOfCommentThread(response.body));
//             expect(response.body.visibility === "public");
//
//             await setPermissions({"manageRestrictedComments" : false});
//         });
//     });
//
//     /**
//      * /api/course/:courseID
//      * - response should be a Course
//      * - name of course can be set with permission to manage courses
//      * - state of course can be set with permission to manage courses
//      * /api/course/:courseID/user/:userID
//      * - response should be CourseRegistrationOutput
//      * - user can be enrolled in a course with manage user registration permission
//      */
//     describe("Courses", () => {
//         it("Should not be possible to create a course without permission.", async() => {
//             const response = await createCourse("Test Course", courseState.open);
//             expect(response).to.have.status(401);
//         });
//
//         it("Should be possible to create a course with permission.", async() => {
//             await setPermissions({"manageCourses" : true});
//
//             const response = await createCourse("Test Course", courseState.open);
//             expect(response).to.have.status(200);
//             assert(instanceOfCoursePartial(response.body));
//             expect(response.body.state).to.equal(courseState.open);
//             expect(response.body.name).to.equal("Test Course");
//             createdCourseID = response.body.ID;
//
//             await setPermissions({"manageCourses" : false});
//         });
//
//         it("Should enroll a user after creating a course", async() => {
//             const response = await getCourses();
//             expect(response).to.have.status(200);
//             assert(response.body.every((course : CoursePartial) => instanceOfCoursePartial(course)));
//
//             const courses : CoursePartial[] = response.body;
//             assert(courses.some((course : CoursePartial) => course.ID === createdCourseID));
//         });
//
//         it("Should not be possible to set name / state of a course without permission", async() => {
//             assert(createdCourseID !== undefined);
//             const response = await updateCourse(createdCourseID!, {name : "Test Course 2", state : courseState.hidden});
//             expect(response).to.have.status(401);
//         });
//
//         it("Should be possible to set name / state of a course with permission.", async() => {
//             await setPermissions({"manageCourses" : true});
//
//             const response = await updateCourse(createdCourseID!, {name : "Test Course 3", state : courseState.hidden});
//             expect(response).to.have.status(200);
//             assert(instanceOfCoursePartial(response.body));
//             expect(response.body.name).to.equal("Test Course 3");
//             expect(response.body.state).to.equal(courseState.hidden);
//
//             await setPermissions({"manageCourses" : false});
//         });
//
//         it("Should not be possible to remove a user from a course without permission.", async() => {
//             assert(createdCourseID !== undefined);
//             const response = await registerUserCourse(createdCourseID!, USER_ID);
//             expect(response).to.have.status(401);
//         });
//
//         it("Should be possible to remove a user from a course with permission.", async() => {
//             await setPermissions({"manageUserRegistration" : true});
//
//             assert(createdCourseID !== undefined);
//             const response = await unregisterUserCourse(createdCourseID!, USER_ID);
//             expect(response).to.have.status(200);
//             assert(instanceOfCourseUser(response.body));
//
//             await setPermissions({"manageUserRegistration" : false});
//         });
//
//         it("Should be possible to enroll a user in a course with permission.", async() => {
//             await setPermissions({"manageUserRegistration" : true});
//
//             assert(createdCourseID !== undefined);
//             const response = await registerUserCourse(createdCourseID!, USER_ID);
//             expect(response).to.have.status(200);
//             assert(instanceOfCourseUser(response.body));
//
//             await unregisterUserCourse(createdCourseID!, USER_ID);
//             await setPermissions({"manageUserRegistration" : false});
//         });
//
//         it("Should not be possible to delete a course without permission", async() => {
//             assert(createdCourseID !== undefined);
//             const response = await deleteCourse(createdCourseID!);
//             expect(response).to.have.status(401);
//         });
//
//         it("Should be possible to delete a course with permission.", async() => {
//             await setPermissions({"manageCourses" : true});
//
//             assert(createdCourseID !== undefined);
//             const response = await deleteCourse(createdCourseID!);
//             expect(response).to.have.status(200);
//             assert(instanceOfCoursePartial(response.body));
//
//             await setPermissions({"manageCourses" : false});
//         });
//     });
//
//     /**
//      * /role/course/:courseID/user/:userID/:role
//      * - response should be CourseRegistrationOutput
//      * - user role can be set if permission to manage user permissions manager
//      * // TODO add api path to set global role of a user
//      */
//     describe("Roles", () => {
//         // TODO
//     });
//
//     /**
//      * /api/permission/course/:courseID/user/:userID
//      * - response should be Permission
//      * - user can set view permissions with permission to manage view permissions
//      * - user can set manage permissions with permission to manage manage permissions
//      * /api/permission/user/:userID
//      * - response should be Permission
//      * - user can set view permissions with permission to manage view permissions
//      * - user can set manage permissions with permission to manage manage permissions
//      */
//     describe("Permissions", () => {
//         it("Should not be possible to update global user permissions without permission.", async() => {
//             // TODO
//         });
//
//         it("Should not be possible to update course user permissions without permission", async() => {
//             // TODO
//         });
//
//         it("Should be possible to update view user permissions in a course with permission", async() => {
//             // TODO
//         });
//
//         it("Should be possible to update view user permissions globally with permission", async() => {
//             // TODO
//         });
//
//         it("Should be possible to update manage user permissions in a course with permission", async() => {
//             // TODO
//         });
//
//         it("Should be possible to update manage user permissions globally with permission.", async() => {
//             // TODO
//         });
//     });
//
//     /**
//      * /api/user
//      * - response should be User
//      * - user can set name
//      * - user can set email
//      */
//     describe("Users", () => {
//         it("Should be possible for a user to update name / email.", async() => {
//             // TODO
//         });
//     });
// });