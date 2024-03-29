import {expect} from "chai";
import {assert} from "console";

import {Course, CoursePartial} from "../../../../models/api/Course";
import {User} from "../../../../models/api/User";

import {UserDB} from "../../../../api/src/database/UserDB";
import {issueToken} from "../../../../api/src/helpers/AuthenticationHelper";

import {instanceOfCoursePartial, instanceOfUser} from "../../../InstanceOf";
import {
    setAPITestUserValues,
    adminSetPermissions,
    adminCoursesToUnregister,
    adminUnregisterCourse,
    adminSetRoleCourse,
    adminSetRoleGlobal,
    getOwnUser1,
    getCourses,
    DEFAULT_GLOBAL_PERMISSIONS,
    ping,
} from "../APIRequestHelper";

export function setup() {
    /**
     * Set user to set user, and receive a token for the API
     * Unregister user from default course, and remove permissions.
     * Wait for the server to start
     */

    before(async function () {
        // Get test user and set token
        const USER_ID = (await UserDB.filterUser({userName: "test user", limit: 1}))[0].ID;
        const USER_AUTHORIZATION_KEY = issueToken(USER_ID);
        setAPITestUserValues(USER_ID, USER_AUTHORIZATION_KEY);

        // Wait running the tests until the server has started
        let response;
        do {
            // Wait for 100 ms
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log("[Test Setup] Pinging server...");
            // Ping the server and see if it is up
            response = await ping();
            console.log(`[Test Setup] Got ${response.status}: ${response.text}`);
        } while (response.status !== 204);
        console.log("[Test Setup] Server is up.");
    });

    /**
     * Reset user permissions & course registrations before each test.
     * If a single test fails, permissions are not set back automatically in the test.
     * Thus they are reset before each test so that future tests do not fail.
     */
    beforeEach(async () => {
        await removeAllPermissions();
        await removeAllRegistrations();
        await setDefaultRoles();
    });

    async function removeAllPermissions() {
        await adminSetPermissions({
            "manageUserPermissionsView": false,
            "manageUserPermissionsManager": false,
            "manageUserRole": false,
            "viewAllUserProfiles": false,
            "manageUserRegistration": false,
            "viewAllCourses": false,
            "addCourses": false,
            "manageCourses": false,
            "addAssignments": false,
            "manageAssignments": false,
            "viewAllSubmissions": false,
            "viewRestrictedComments": false,
            "addRestrictedComments": false,
            "manageRestrictedComments": false,
            "mentionAllStudents": false,
            "mentionAllAssistants": false,
            "mentionAllTeachers": false,
            "mentionNoLimit": false,
        });
    }

    async function removeAllRegistrations() {
        const response = await adminCoursesToUnregister();
        for (const course of response.body as CoursePartial[]) {
            assert(instanceOfCoursePartial(course));
            await adminUnregisterCourse(course.ID);
        }
    }

    async function setDefaultRoles() {
        await adminSetRoleCourse();
        await adminSetRoleGlobal();
    }

    /**
     * Check permissions of the user at the start of the test. User should not have
     * any permissions.
     */
    it("Should have default permissions at the start of the test", async () => {
        const response = await getOwnUser1();
        expect(response).to.have.status(200);

        const user = response.body as User;
        assert(instanceOfUser(user));
        expect(user.permission.permissions).to.equal(DEFAULT_GLOBAL_PERMISSIONS);
    });

    /**
     * Check that user is not registered in any courses prior to the rest of the tests.
     */
    it("Should have no course registrations at the start of the test", async () => {
        let response = await getCourses();
        expect(response).to.have.status(200);
        expect((response.body as Course[]).length).to.equal(0);

        response = await adminCoursesToUnregister();
        expect((response.body as Course[]).length).to.equal(0);
    });
}
