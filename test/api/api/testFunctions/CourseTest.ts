import { expect } from "chai";
import { assert } from "console";

import { CoursePartial } from "../../../../models/api/Course";
import { CourseState } from "../../../../models/enums/CourseStateEnum";

import { instanceOfCoursePartial } from "../../../InstanceOf";
import {
    getCourse,
    getCourses,
    getCoursesByOwnUser,
    getCoursesByOtherUser,
    adminRegisterCourse,
    adminUnregisterCourse,
    adminSetPermissions,
    createCourse
} from "../APIRequestHelper";

export function courseTest() {
    const createdCourseID: string | undefined = undefined;
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
            await adminSetPermissions({ "viewAllCourses": true });
            await coursePermissions();
            await adminSetPermissions({ "viewAllCourses": false });
        });

        it("Should not be possible to create a course without permission.", async () => {
            const response = await createCourse("Test Course", CourseState.open);
            expect(response).to.have.status(401);
        });

        // TODO [TEST]: Fails
        // it('Should be possible to create a course with \'addCourse\' permission, and have user be enrolled.', async () => {
        //   await adminSetPermissions({'addCourses': true});

        //   // Create course
        //   let response = await createCourse('Test Course', CourseState.open);
        //   expect(response).to.have.status(200);
        //   assert(instanceOfCoursePartial(response.body));
        //   expect(response.body.state).to.equal(CourseState.open);
        //   expect(response.body.name).to.equal('Test Course');
        //   createdCourseID = response.body.ID;

        //   // User is enrolled
        //   response = await getCourses();
        //   expect(response).to.have.status(200);
        //   assert(response.body.every((course: CoursePartial) => instanceOfCoursePartial(course)));

        //   const courses: CoursePartial[] = response.body;
        //   assert(courses.some((course: CoursePartial) => course.ID === createdCourseID));

        //   await adminSetPermissions({'addCourses': false});
        // });

        // TODO [TEST]: Fails
        // it('Should not be possible to set name / state of a course without permission', async () => {
        //   assert(createdCourseID !== undefined);
        //   const response = await updateCourse(createdCourseID!, {name: 'Test Course 2', state: CourseState.hidden});
        //   expect(response).to.have.status(401);
        // });

        // TODO [TEST]: Fails
        // it('Should be possible to set name / state of a course with \'manageCourses\' permission.', async () => {
        //   await adminSetPermissions({'manageCourses': true});

        //   // Update course name / state
        //   const response = await updateCourse(createdCourseID!, {name: 'Test Course 3', state: CourseState.hidden});
        //   expect(response).to.have.status(200);
        //   assert(instanceOfCoursePartial(response.body));
        //   expect(response.body.name).to.equal('Test Course 3');
        //   expect(response.body.state).to.equal(CourseState.hidden);

        //   await adminSetPermissions({'manageCourses': false});
        // });

        // TODO [TEST]: Fails
        // it('Should not be possible to remove a user from a course without permission.', async () => {
        //   assert(createdCourseID !== undefined);
        //   const response = await registerUserCourse(createdCourseID!, USER_ID);
        //   expect(response).to.have.status(401);
        // });

        // TODO [TEST]: Fails
        // it('Should be possible to enroll a user in a course with \'manageUserRegistration\' permission, and unregister.', async () => {
        //   await adminSetPermissions({'manageUserRegistration': true});

        //   // Enroll user ins course
        //   assert(createdCourseID !== undefined);
        //   let response = await registerUserCourse(createdCourseID!, USER_ID);
        //   expect(response).to.have.status(200);
        //   assert(instanceOfCourseUser(response.body));

        //   // Unregister user from course
        //   response = await unregisterUserCourse(createdCourseID!, USER_ID);
        //   expect(response).to.have.status(200);
        //   assert(instanceOfCourseUser(response.body));

        //   await unregisterUserCourse(createdCourseID!, USER_ID);
        //   await adminSetPermissions({'manageUserRegistration': false});
        // });

        // TODO [TEST]: Fails
        // it('Should not be possible to delete a course without permission', async () => {
        //   assert(createdCourseID !== undefined);
        //   const response = await deleteCourse(createdCourseID!);
        //   expect(response).to.have.status(401);
        // });

        // TODO [TEST]: Fails
        // it('Should be possible to delete a course with \'manageCourses\' permission.', async () => {
        //   await adminSetPermissions({'manageCourses': true});

        //   assert(createdCourseID !== undefined);
        //   const response = await deleteCourse(createdCourseID!);
        //   expect(response).to.have.status(200);
        //   assert(instanceOfCoursePartial(response.body));

        //   await adminSetPermissions({'manageCourses': false});
        // });
    });
}
