import {expect} from "chai";
import {assert} from "console";

import {CommentThread} from "../../../../models/api/CommentThread";
import {ThreadState} from "../../../../models/enums/ThreadStateEnum";

import {instanceOfCommentThread} from "../../../InstanceOf";
import {
    adminSetPermissions,
    getCommentThread,
    getCommentThreadByFile,
    getCommentThreadBySubmission,
    getCommentThreadBySubmissionRecent,
    adminRegisterCourse,
    adminUnregisterCourse,
    setCommentThreadPrivate,
    setCommentThreadPublic
} from "../APIRequestHelper";

export function commentThreadTest() {
    /**
     * GET requests:
     * /api/commentThread/:commentThread
     * - response should be CommentThread
     * - user should be enrolled in the course or have permission to view all courses.
     * /api/commentThread/file/:fileID
     * - response should be CommentThread[]
     * - user should be enrolled in the course of have permission to view all courses.
     * - user should have permission to view private comment threads
     * /api/commentThread/submission/:submissionID
     * - response should be CommentThread[]
     * - user should be enrolled in the course of have permission to view all courses.
     * - user should have permission to view private comment threads
     * /api/commentThread/submission/:submissionID/recent
     * - response should be CommentThread[]
     * - user should be enrolled in teh course of have permission to view all courses.
     * - user should have permission to view private comment threads
     *
     * PUT requests:
     * /api/commentThread/:commentThread
     * - response should be a comment thread
     * - user should be able to update visibility
     * - user should have permission to manage the comment thread
     */
    describe("Comment threads", () => {
        async function commentThreadsPermissions(threadStates = [ThreadState.public, ThreadState.private]) {
            // User can access a specific comment thread with permission
            let response = await getCommentThread();
            expect(response).to.have.status(200);
            assert(instanceOfCommentThread(response.body));

            // User can access comment threads of a file with permission
            response = await getCommentThreadByFile();
            expect(response).to.have.status(200);
            assert((response.body as CommentThread[]).every((commentThread: CommentThread) =>
                instanceOfCommentThread(commentThread) &&
                threadStates.includes(commentThread.visibility)
            ));

            // User can access comment threads of a submission with permission
            response = await getCommentThreadBySubmission();
            expect(response).to.have.status(200);
            assert((response.body as CommentThread[]).every((commentThread: CommentThread) =>
                instanceOfCommentThread(commentThread) &&
                threadStates.includes(commentThread.visibility)
            ));

            // User can access recent comment threads of a submission with permission
            response = await getCommentThreadBySubmissionRecent();
            expect(response).to.have.status(200);
            assert((response.body as CommentThread[]).every((commentThread: CommentThread) =>
                instanceOfCommentThread(commentThread) &&
                threadStates.includes(commentThread.visibility)
            ));
        }

        async function commentThreadsNoPermissions() {
            // User cannot get a comment thread without permission
            let response = await getCommentThread();
            expect(response).to.have.status(401);

            // User cannot get comment threads of a file without permission
            response = await getCommentThreadByFile();
            expect(response).to.have.status(401);

            // User cannot get comment threads of a submission without permission
            response = await getCommentThreadBySubmission();
            expect(response).to.have.status(401);

            // User cannot get recent comment threads of a submission without permission
            response = await getCommentThreadBySubmissionRecent();
            expect(response).to.have.status(401);
        }

        async function setVisibility() {
            // Change comment thread to private
            let response = await setCommentThreadPrivate();
            expect(response).to.have.status(200);
            expect(instanceOfCommentThread(response.body));
            expect((response.body as { visibility: string }).visibility === "private");

            // Change comment thread to public
            response = await setCommentThreadPublic();
            expect(response).to.have.status(200);
            expect(instanceOfCommentThread(response.body));
            expect((response.body as { visibility: string }).visibility === "public");
        }

        it("Should not be possible to view comment threads without permission.", async() => {
            await commentThreadsNoPermissions();
        });

        it("Should be possible to view comment threads if registered in the course.", async() => {
            await adminRegisterCourse();
            await commentThreadsPermissions();
            await adminUnregisterCourse();
        });

        it("Should be possible to view comment threads with 'viewAllCourses' permission.", async() => {
            await adminSetPermissions({"viewAllCourses": true});
            await commentThreadsPermissions();
            await adminSetPermissions({"viewAllCourses": false});
        });

        it("Should be possible to set visibility as owner without permission.", async () => {
            await setVisibility();
        });

        it("Should be possible to set visibility with 'manageRestrictedComment' permission", async() => {
            await adminSetPermissions({"manageRestrictedComments": true});
            await setVisibility();
            await adminSetPermissions({"manageRestrictedComments": false});
        });
    });
}
