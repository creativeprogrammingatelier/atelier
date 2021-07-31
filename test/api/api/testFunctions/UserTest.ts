import {expect} from "chai";
import {assert} from "console";

import {CourseUser} from "../../../../models/api/CourseUser";
import {User} from "../../../../models/api/User";

import {instanceOfUser, instanceOfCourseUser} from "../../../InstanceOf";
import {
    getOwnUser1,
    getOwnUser2,
    getOtherUser,
    adminSetPermissions,
    getUsersByCourse,
    getUsers,
    randomString,
    updateUserName,
    updateUserEmail
} from "../APIRequestHelper";

export function userTest() {
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
		
        it("Should be possible to retrieve your own user profile", async() => {
            let response = await getOwnUser1();
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));
			
            response = await getOwnUser2();
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));
        });
		
        it("Should not be possible to retrieve another user profile without permission", async() => {
            const response = await getOtherUser();
            expect(response).to.have.status(401);
        });
		
        it("Should be possible to get another user profile with ‘viewAllUserProfiles’ permission", async() => {
            await adminSetPermissions({"viewAllUserProfiles": true});
			
            const response = await getOtherUser();
            expect(response).to.have.status(200);
            assert(instanceOfUser(response.body));
			
            await adminSetPermissions({"viewAllUserProfiles": false});
        });
		
        it("Should not be possible to get course users without permission", async() => {
            const response = await getUsersByCourse();
            expect(response).to.have.status(401);
        });
		
        it("Should not be possible to get all users without permission to view all user profiles", async() => {
            const response = await getUsers();
            expect(response).to.have.status(401);
        });
		
        it("Should be possible to get all course users with 'viewAllUserProfiles' permission", async() => {
            await adminSetPermissions({"viewAllUserProfiles": true});
			
            const response = await getUsersByCourse();
            expect(response).to.have.status(200);
            assert(response.body.every((user: CourseUser) => instanceOfCourseUser(user)));
			
            await adminSetPermissions({"viewAllUserProfiles": false});
        });
		
        it("Should be possible to get all users with 'viewAllUserProfiles' permission", async() => {
            await adminSetPermissions({"viewAllUserProfiles": true});
			
            const response = await getUsers();
            expect(response).to.have.status(200);
            assert(response.body.every((user: User) => instanceOfUser(user)));
			
            await adminSetPermissions({"viewAllUserProfiles": false});
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
}