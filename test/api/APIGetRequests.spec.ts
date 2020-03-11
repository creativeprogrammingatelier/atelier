import 'mocha';
import { app } from "../../api/src/app";
import chai, {expect, assert} from "chai";
import chaiHttp from "chai-http";

import {issueToken} from "../../api/src/helpers/AuthenticationHelper";
import {User} from "../../models/api/User";
import {instanceOfCommentThread, instanceOfUser} from "../InstanceOf";

chai.use(chaiHttp);

/** URL of the website */
const BASE_URL = "http://localhost:5000";
/** ID of an account to which permissions are added/removed for testing */
const USER_ID = "r5zoYKbiTLiBA0swG6gZ2Q";
/** ID of an admin account to set permissions on the user */
const ADMIN_ID = "AAAAAAAAAAAAAAAAAAAAAA";

/** Default IDs assumed to be in the database */
/** COMMENT_THREAD_ID in FILE_ID in SUBMISSION_ID in COURSE_ID */
const COURSE_ID = "AAAAAAAAAAAAAAAAAAAAAA";
const SUBMISSION_ID = "AAAAAAAAAAAAAAAAAAAAAA";
const FILE_ID = "AAAAAAAAAAAAAAAAAAAAAA";
const COMMENT_THREAD_ID = "AAAAAAAAAAAAAAAAAAAAAA";

/** Authorization keys */
const USER_AUTHORIZATION_KEY = issueToken(USER_ID);
const ADMIN_AUTHORIZATION_KEY = issueToken(ADMIN_ID);

/** User requests */
const getUser = () => chai.request(app)
    .get(`/api/user/${USER_ID}`)
    .set({'Authorization' : USER_AUTHORIZATION_KEY});
const getCommentThread = () => chai.request(app)
    .get(`/api/commentThread/${COMMENT_THREAD_ID}`)
    .set({'Authorization' : USER_AUTHORIZATION_KEY});

/** Admin requests */
const registerCourse = () => chai.request(app)
    .put(`/api/course/${COURSE_ID}/user/${USER_ID}`)
    .set({'Authorization' : ADMIN_AUTHORIZATION_KEY});
const unregisterCourse = () => chai.request(app)
    .delete(`/api/course/${COURSE_ID}/user/${USER_ID}`)
    .set({'Authorization' : ADMIN_AUTHORIZATION_KEY});
const setPermissions = (permissions : any) => chai.request(app)
    .put(`/api/permission/user/${USER_ID}`)
    .send({permissions : permissions})
    .set({'Authorization' : ADMIN_AUTHORIZATION_KEY, 'Content-Type' : 'application/json'});


describe("API permissions", () => {
    before(async() => {
        await unregisterCourse();
    });

    it("Should have have default permissions at the start of the test", async () => {
        const response = await getUser();
        expect(response).to.have.status(200);

        // Currently default permission is 1. Will probably change later.
        const user : User = response.body;
        assert(instanceOfUser(user));
        expect(user.permission.permissions).to.equal(1);
    });

    describe("Comment threads", async () => {
        it("Should not view comment thread if not enrolled in the course", async () => {
            const response = await getCommentThread();
            expect(response).to.have.status(401);
        });

        it("Should view comment thread if enrolled in the course", async() => {
           await registerCourse();

           const response = await getCommentThread();
           expect(response).to.have.status(200);
           assert(instanceOfCommentThread(response.body));

           await unregisterCourse();
        });

        it("Should view comment thread if permission to view all courses", async() => {
            await setPermissions({"viewAllCourses" : true});

            let response = await getCommentThread();
            expect(response).to.have.status(200);
            assert(instanceOfCommentThread(response.body));

            await setPermissions({"viewAllCourses" : false});

            response = await getCommentThread();
            expect(response).to.have.status(401);
        });
    });
});

/** User is not registered in the course prior to each test */


// describe("Comment Threads should have proper permissions", () => {
//     it("Should not view comment threads if not registered in the course", async() => {
//         const response = await chai.request(app).get('/api/')
//     });
// });


// describe("Check whether proper information is returned in get requests based on user permissions", () => {
    // describe("Comment Threads should have proper permissions", async () => {
    //      it("Should not view comment thread if not registered in the course", async() => {
    //          const error : APIError = await getCommentThread();
    //          console.log(error);
    //          assert(instanceOfError(error), "Expecting permission denied from API");
    //      });
    //
    //      it("Should view comment thread if registered in the course", async() => {
    //          await registerCourse();
    //          const commentThread : CommentThread = await getCommentThread();
    //          assert(instanceOfCommentThread(commentThread), "Expecting comment thread from API");
    //          await unregisterCourse();
    //      });
    //
    //      it("Should view comment thread if permission to view all courses", async() => {
    //          const error : APIError = await getCommentThread();
    //          assert(instanceOfError(error), "Expecting permission denied from API");
    //
    //          await setPermissions({"permissions" : { "viewAllCourses" : true}});
    //          const commentThread : CommentThread = await getCommentThread();
    //          assert(instanceOfCommentThread(commentThread), "Expecting comment thread from API");
    //          await setPermissions({"permissions" : { "viewAllCourses" : false}});
    //      });
    //
    // });

    // TODO comment thread can only be access if registered in the course (or permission for viewing all courses)

    // TODO file can only be accessed if registered in the course (or permission for viewing all courses)

    // TODO submission can only be accessed if registered in the course (or permission for viewing all courses)

    // TODO recent submissions can only accessed if registered in the course (or permission for viewing all courses)

    // TODO get all courses if permission for viewing all courses

    // TODO get courses only if enrolled if no permission for viewing all courses

    // TODO get course only possible if enrolled (or permission for viewing all courses)

    // TODO get submissions of a course required user being registered.

    // TODO get submissions only returns own submissions unless permission to view all submissions

    // TODO get submissions of user required you being the user, or having permission to view all submissions

    // TODO view all users requires view all user profiles permission

    // TODO get a specific user requires you being the user or having access to view all user profiles

    // TODO search test once last decisions made for search page
// });