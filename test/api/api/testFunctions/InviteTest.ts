import {expect} from "chai";
import {assert} from "console";

import {CourseInvite, Invite} from "../../../../models/api/Invite";
import {instanceOfInvite} from "../../../InstanceOf";
import {
    getInvitesByUserAndCourse,
    getInviteStudent,
    getInviteTA,
    getInviteTeacher,
    deleteInviteStudent,
    deleteInviteTA,
    deleteInviteTeacher,
    setPermissionsGlobal,
    adminSetPermissions
} from "../APIRequestHelper";

export function inviteTest() {
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
    describe("Invites", () => {
        async function checkInviteEmpty() {
            const response = await getInvitesByUserAndCourse();

            expect((response.body as Invite).student).to.equal(undefined);
            expect((response.body as Invite).TA).to.equal(undefined);
            expect((response.body as Invite).teacher).to.equal(undefined);
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

            await setPermissionsGlobal({"manageUserRegistration": true});
            await checkInviteEmpty();
            await setPermissionsGlobal({"manageUserRegistration": false});
        });

        it("Should be possible to create and receive links.", async() => {
            await adminSetPermissions({"manageUserRegistration": true});

            // User can create a student invite link with permission
            let response = await getInviteStudent();
            expect(response).to.have.status(200);
            assert(instanceOfInvite(response.body));
            const studentInviteID: string = (response.body as CourseInvite).inviteID;

            // User can create a TA invite link with permission
            response = await getInviteTA();
            expect(response).to.have.status(200);
            assert(instanceOfInvite(response.body));
            const taInviteID: string = (response.body as CourseInvite).inviteID;

            // User can create a teacher invite link with permission
            response = await getInviteTeacher();
            expect(response).to.have.status(200);
            assert(instanceOfInvite(response.body));
            const teacherInviteID: string = (response.body as CourseInvite).inviteID;

            // Check that invite links exist now
            response = await getInvitesByUserAndCourse();
            expect(response).to.have.status(200);
            expect((response.body as Invite).student).to.equal(studentInviteID);
            expect((response.body as Invite).TA).to.equal(taInviteID);
            expect((response.body as Invite).teacher).to.equal(teacherInviteID);

            await adminSetPermissions({"manageUserRegistration": false});
        });

        it("Should be possible to delete links.", async() => {
            await adminSetPermissions({"manageUserRegistration": true});

            let response = await getInvitesByUserAndCourse();
            expect(response).to.have.status(200);

            const studentInviteID = (response.body as Invite).student;
            const taInviteID = (response.body as Invite).TA;
            const teacherInviteID = (response.body as Invite).teacher;

            // User can delete a student invite link
            response = await deleteInviteStudent();
            expect(response).to.have.status(200);
            assert(instanceOfInvite((response.body as CourseInvite[])[0]));
            expect((response.body as CourseInvite[])[0].inviteID).to.equal(studentInviteID);

            // User can delete a TA invite link
            response = await deleteInviteTA();
            expect(response).to.have.status(200);
            assert(instanceOfInvite((response.body as CourseInvite[])[0]));
            expect((response.body as CourseInvite[])[0].inviteID).to.equal(taInviteID);

            // User can delete a teacher invite link
            response = await deleteInviteTeacher();
            expect(response).to.have.status(200);
            assert(instanceOfInvite((response.body as CourseInvite[])[0]));
            expect((response.body as CourseInvite[])[0].inviteID).to.equal(teacherInviteID);

            await checkInviteEmpty();

            await adminSetPermissions({"manageUserRegistration": false});
        });
    });
}
