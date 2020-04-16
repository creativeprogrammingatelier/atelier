import 'mocha';

import {commentTest} from './testFunctions/CommentsTest';
import {commentThreadTest} from './testFunctions/CommentThreadTest';
import {courseTest} from './testFunctions/CourseTest';
import {inviteTest} from './testFunctions/InviteTest';
import {permissionTest} from './testFunctions/PermissionTest';
import {roleTest} from './testFunctions/RoleTest';
import {searchTest} from './testFunctions/SearchTest';
import {setup} from './testFunctions/setup'
import {submissionTest} from './testFunctions/SubmissionTest';
import {userTest} from './testFunctions/UserTest';

describe("API Tests", () => {
	setup();
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