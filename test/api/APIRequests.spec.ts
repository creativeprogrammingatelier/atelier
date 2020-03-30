import 'mocha';
import { commentTest } from './testFunctions/CommentsTest';
import {setup } from './testFunctions/setup'
import { commentThreadTest } from './testFunctions/CommentThreadTest';
import { courseTest } from './testFunctions/CourseTest';
import { inviteTest } from './testFunctions/InviteTest';
import { permissionTest } from './testFunctions/PermissionTest';
import { searchTest } from './testFunctions/SearchTest';
import { roleTest } from './testFunctions/RoleTest';
import { submissionTest } from './testFunctions/SubmissionTest';
import { userTest } from './testFunctions/UserTest';

//this was a 1000+ line file. 
//extracted methods make it more readable and maintainable for everyone.
describe("API Tests", () => {
    setup()

    commentTest()

    commentThreadTest()

    courseTest()
    
    inviteTest()
    
    permissionTest()

    roleTest()

    searchTest()

    submissionTest()

    userTest()

});