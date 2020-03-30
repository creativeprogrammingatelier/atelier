import { expect, assert } from "chai";
import { setCourseRole, setGlobalRole, adminSetPermissions, adminRegisterCourse, adminUnregisterCourse } from "../APIRequestHelper";
import { courseRole } from "../../../models/enums/courseRoleEnum";
import { globalRole } from "../../../models/enums/globalRoleEnum";
import { instanceOfUser, instanceOfCourseUser } from "../../InstanceOf";

export function roleTest(){
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
}