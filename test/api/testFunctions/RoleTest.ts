import {expect, assert} from "chai";
import {
    setCourseRole,
    setGlobalRole,
    adminSetPermissions,
    adminRegisterCourse,
    adminUnregisterCourse
} from "../APIRequestHelper";
import {CourseRole} from "../../../models/enums/CourseRoleEnum";
import {GlobalRole} from "../../../models/enums/GlobalRoleEnum";
import {instanceOfUser, instanceOfCourseUser} from "../../InstanceOf";

export function roleTest() {
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
        it("Should not be possible to set a role without permission.", async () => {
            let response = await setCourseRole(CourseRole.TA);
            expect(response).to.have.status(401);

            response = await setGlobalRole(GlobalRole.staff);
            expect(response).to.have.status(401);
        });

        it("Should be possible to set global role with 'manageUserRole' permission.", async () => {
            await adminSetPermissions({"manageUserRole": true});

            const roles = [GlobalRole.user, GlobalRole.plugin, GlobalRole.staff, GlobalRole.admin];
            for (let i = 0; i < roles.length; i++) {
                const response = await setGlobalRole(roles[i]);
                expect(response).to.have.status(200);
                assert(instanceOfUser(response.body));
                expect(response.body.permission.globalRole).to.equal(roles[i]);
            }

            await adminSetPermissions({"manageUserRole": false});
        });

        it("Should be possible to set course role with 'manageUserRole' permission.", async () => {
            await adminRegisterCourse();
            await adminSetPermissions({"manageUserRole": true});

            const roles = [CourseRole.plugin, CourseRole.student, CourseRole.TA, CourseRole.teacher, CourseRole.moduleCoordinator];
            for (let i = 0; i < roles.length; i++) {
                const response = await setCourseRole(roles[i]);
                expect(response).to.have.status(200);
                assert(instanceOfCourseUser(response.body));
                expect(response.body.permission.courseRole).to.equal(roles[i]);
            }

            await adminSetPermissions({"manageUserRole": false});
            await adminUnregisterCourse();
        });
    });
}