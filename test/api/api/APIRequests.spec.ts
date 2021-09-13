import "mocha";
import {expect} from "chai";

import {ping} from "./APIRequestHelper";
import {commentTest} from "./testFunctions/CommentsTest";
import {commentThreadTest} from "./testFunctions/CommentThreadTest";
import {courseTest} from "./testFunctions/CourseTest";
import {inviteTest} from "./testFunctions/InviteTest";
import {permissionTest} from "./testFunctions/PermissionTest";
import {roleTest} from "./testFunctions/RoleTest";
import {searchTest} from "./testFunctions/SearchTest";
import {setup} from "./testFunctions/setup";
import {submissionTest} from "./testFunctions/SubmissionTest";
import {userTest} from "./testFunctions/UserTest";

describe("API Tests", () => {
    setup();

    it("should return 204 on a ping to check if the server is up", async () => {
        const response = await ping();
        expect(response.status).to.equal(204);
    });

    commentTest();
    commentThreadTest();
    courseTest();
    inviteTest();
    permissionTest();
    roleTest();
    searchTest();
    submissionTest();
    userTest();
});
