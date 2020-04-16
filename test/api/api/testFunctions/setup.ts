import {expect} from "chai";
import {assert} from "console";

import {CoursePartial} from "../../../../models/api/Course";
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
	DEFAULT_GLOBAL_PERMISSIONS
} from "../APIRequestHelper";

export function setup() {
	
	/**
	 * Set user to set user, and receive a token for the API
	 * Unregister user from default course, and remove permissions.
	 */
	before(async() => {
		// Get test user and set token
		const USER_ID = (await UserDB.filterUser({userName: "test user", limit: 1}))[0].ID;
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
			"mentionNoLimit": false
		});
	}
	
	async function removeAllRegistrations() {
		const response = await adminCoursesToUnregister();
		for (let i = 0; i < response.body.length; i++) {
			const course: CoursePartial = response.body[i];
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
	it("Should have default permissions at the start of the test", async() => {
		const response = await getOwnUser1();
		expect(response).to.have.status(200);
		
		const user: User = response.body;
		assert(instanceOfUser(user));
		expect(user.permission.permissions).to.equal(DEFAULT_GLOBAL_PERMISSIONS);
	});
	
	/**
	 * Check that user is not registered in any courses prior to the rest of the tests.
	 */
	it("Should have no course registrations at the start of the test", async() => {
		let response = await getCourses();
		expect(response).to.have.status(200);
		expect(response.body.length).to.equal(0);
		
		response = await adminCoursesToUnregister();
		expect(response.body.length).to.equal(0);
	});
}