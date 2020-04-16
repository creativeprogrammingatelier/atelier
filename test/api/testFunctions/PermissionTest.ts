import {
    setPermissionsCourse,
    setPermissionsGlobal,
    getPermission,
    adminRegisterCourse,
    getPermissionByCourse,
    adminUnregisterCourse,
    adminSetPermissions,
    DEFAULT_GLOBAL_PERMISSIONS,
    DEFAULT_COURSE_PERMISSIONS
} from "../APIRequestHelper";
import {expect} from "chai";
import {assert} from "console";
import {instanceOfPermission, instanceOfUser, instanceOfCourseUser} from "../../InstanceOf";
import {
    viewPermissions,
    PermissionEnum,
    containsPermission,
    managePermissions
} from "../../../models/enums/PermissionEnum";
import {getEnum} from "../../../helpers/EnumHelper";

export function permissionTest() {
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
    describe("Permissions", async () => {
        function setManagePermissions(course: boolean, state: boolean) {
            const permissions = {
                "manageUserPermissionsManager": state,
                "manageUserPermissionsView": state,
                "manageUserRole": state,
                "manageUserRegistration": state,
                "addCourses": state,
                "manageCourses": state,
                "addAssignments": state,
                "manageAssignments": state,
                "addRestrictedComments": state,
                "manageRestrictedComments": state,
                "mentionAllStudents": state,
                "mentionAllAssistants": state,
                "mentionAllTeachers": state,
                "mentionNoLimit": state
            };
            return course ?
                setPermissionsCourse(permissions)
                :
                setPermissionsGlobal(permissions);
        }

        function setViewPermissions(course: boolean, state: boolean) {
            const permissions = {
                "viewAllUserProfiles": state,
                "viewAllCourses": state,
                "viewAllSubmissions": state,
                "viewRestrictedComments": state
            };
            return course ?
                setPermissionsCourse(permissions)
                :
                setPermissionsGlobal(permissions);
        }

        async function setAllPermissions(course: boolean, state: boolean) {
            await setViewPermissions(course, state);
            return setManagePermissions(course, state);
        }

        it("Should be possible to get own global permissions", async () => {
            const response = await getPermission();
            expect(response).to.have.status(200);
            assert(instanceOfPermission(response.body));
        });

        it("Should be possible to get course permissions if enrolled", async () => {
            await adminRegisterCourse();

            const response = await getPermissionByCourse();
            expect(response).to.have.status(200);
            assert(instanceOfPermission(response.body));

            await adminUnregisterCourse();
        });

        it("Should no permissions to a course if not enrolled", async () => {
            const response = await getPermissionByCourse();
            expect(response).to.have.status(200);
            assert(instanceOfPermission(response.body));
            expect(response.body.permissions).to.equal(DEFAULT_GLOBAL_PERMISSIONS);
        });

        it("Should not be possible to update global user permissions without permission.", async () => {
            const response = await setAllPermissions(false, true);
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));
            expect(response.body.permission.permissions).to.equal(DEFAULT_GLOBAL_PERMISSIONS);
        });

        it("Should not be possible to set course permissions without being enrolled.", async () => {
            const response = await setAllPermissions(true, false);
            expect(response).to.have.status(404);
        });

        it("Should not be possible to update course user permissions without permission", async () => {
            await adminRegisterCourse();

            const response = await setAllPermissions(true, true);
            expect(response).to.have.status(200);
            assert(instanceOfCourseUser(response.body));
            expect(response.body.permission.permissions).to.equal(DEFAULT_COURSE_PERMISSIONS);
        });

        it("Should be possible to update view user permissions with 'manageUserPermissionsView' permission, but not manage permissions.", async () => {
            await adminSetPermissions({"manageUserPermissionsView": true});

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

            await adminSetPermissions({"manageUserPermissionsView": false});
        });

        it("Should be possible to update manage user permissions with 'manageUserPermissionsManager' permission, but not view permissions.", async () => {
            await adminSetPermissions({"manageUserPermissionsManager": true});

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

            await adminSetPermissions({"manageUserPermissionsManager": false});
        });
    });
}