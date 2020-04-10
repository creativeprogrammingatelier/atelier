import {
    getSubmission,
    getSubmissionsByCourse,
    getSubmissionsByOwnCourseUser,
    getSubmissionsByOwnUser,
    getSubmissionsByOtherUser,
    getSubmissionsByOtherCourseUser,
    adminRegisterCourse,
    adminUnregisterCourse,
    adminSetPermissions
} from "../APIRequestHelper";
import {expect} from "chai";
import {assert} from "console";
import {instanceOfSubmission} from "../../InstanceOf";
import {Submission} from "../../../models/api/Submission";

export function submissionTest() {
    /**
     * GET requests:
     * /api/submission/course/:courseID
     * - response should be Submission[]
     * - requires user be to enrolled or have permission to view all courses
     * - should return only owns submissions no permission to view all submissions
     * /api/submission/user/:userID
     * - response should be Submission[]
     * - requires user to be enrolled or have permission to view all courses
     * - requires permission to view all submissions if user is not self
     * /api/submission/course/:courseID/user/:userID
     * - response should be Submission[]
     * - requires user to be enrolled or have permission to view all courses
     * - requires permission to view all submissions is user is not self
     * /api/submission/:submissionID
     * - response should be Submission
     * - requires user to be enrolled or have permission to view all courses
     */

    describe("Submissions", () => {

        async function submissionPermissions(onlyEnrolled = false) {
            // User can get a submission if enrolled in a course
            let response = await getSubmission();
            expect(response).to.have.status(200);
            assert(instanceOfSubmission(response.body));

            // User can get submissions with permission
            response = await getSubmissionsByCourse();
            expect(response).to.have.status(200);
            assert(response.body.every((submission: Submission) => instanceOfSubmission(submission)));

            // User can get own submissions in a course if registered
            response = await getSubmissionsByOwnCourseUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission: Submission) => instanceOfSubmission(submission)));

            // User can get own submissions in a course if registered
            response = await getSubmissionsByOwnUser();
            expect(response).to.have.status(200);
            assert(response.body.every((submission: Submission) => instanceOfSubmission(submission)));

            // User can only get other users submissions with permission
            response = await getSubmissionsByOtherUser();
            if (onlyEnrolled) {
                expect(response).to.have.status(401);
            } else {
                expect(response).to.have.status(200);
                assert(response.body.every((submission: Submission) => instanceOfSubmission(submission)));
            }

            // User can only get other users submission with permission
            response = await getSubmissionsByOtherCourseUser();
            if (onlyEnrolled) {
                expect(response).to.have.status(401);
            } else {
                expect(response).to.have.status(200);
                assert(response.body.every((submission: Submission) => instanceOfSubmission(submission)));
            }
        }

        it("Should not be possible to view submissions without permission.", async () => {
            // User cannot get a submission without permission
            let response = await getSubmission();
            expect(response).to.have.status(401);

            // User cannot get submissions in a course without permission
            response = await getSubmissionsByCourse();
            expect(response).to.have.status(401);

            // User cannot get own submissions in a course without being enrolled
            response = await getSubmissionsByOwnCourseUser();
            expect(response).to.have.status(401);

            // User cannot get other users submission in a course without permission
            response = await getSubmissionsByOtherCourseUser();
            expect(response).to.have.status(401);

            // User cannot get other users submission in a course without permission
            response = await getSubmissionsByOtherUser();
            expect(response).to.have.status(401);
        });

        it("Should be possible to view own submissions in enrolled course. Not of others without permission.", async () => {
            await adminRegisterCourse();

            await submissionPermissions(true);

            await adminUnregisterCourse();
        });

        it("Should be possible to view all submissions in a course with 'viewAllSubmissions' permission", async () => {
            await adminRegisterCourse();
            await adminSetPermissions({"viewAllSubmissions": true});

            await submissionPermissions();

            await adminSetPermissions({"viewAllSubmissions": false});
            await adminUnregisterCourse();
        });
    });
}