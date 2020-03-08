/**
 * Api routes relating to submission information
 */

import express, {Response, Request} from 'express';
import {SubmissionDB} from "../database/SubmissionDB";
import {Submission} from "../../../models/api/Submission";
import {UUIDHelper} from "../helpers/UUIDHelper";
import {capture} from "../helpers/ErrorHelper";
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { archiveProject, deleteNonCodeFiles, FileUploadRequest, uploadMiddleware } from '../helpers/FilesystemHelper';
import { validateProjectServer } from '../../../helpers/ProjectValidationHelper';
import { getCurrentUserID } from '../helpers/AuthenticationHelper';
import { FileDB } from '../database/FileDB';
import {getCurrentRole} from "../helpers/PermissionHelper";

export const submissionRouter = express.Router();
submissionRouter.use(AuthMiddleware.requireAuth);

/**
 * Get submissions of a course
 */
submissionRouter.get('/course/:courseID', capture(async(request: Request, response: Response) => {
    const userID : string = await getCurrentUserID(request);
    const courseID : string = request.params.courseID;
    const currentRole : string | undefined = await getCurrentRole(userID, courseID);
    const viewAllRoles : string[] = ["admin", "TA", "teacher"];
    let submissions : Submission[] = await SubmissionDB.getSubmissionsByCourse(courseID);

    if (currentRole !== undefined && !viewAllRoles.includes(currentRole)) {
        submissions = submissions.filter((submission : Submission) => submission.user.ID === userID);
    }

    response.status(200).send(submissions);
}));

/**
 * Create a new submission containing the files submitted in the body of the request
 */
submissionRouter.post('/course/:courseID', uploadMiddleware.array('files'), capture(async (request, response) => {
    const files = request.files as Express.Multer.File[];
    validateProjectServer(request.body["project"], files);
    const userID = await getCurrentUserID(request);

    // TODO: create a single transaction, including filesystem things
    const submission = await SubmissionDB.addSubmission({ 
        title : request.body["project"],
        courseID: request.params.courseID, 
        userID : userID
    });

    await Promise.all(files.map(file => 
        FileDB.addFile({
            pathname: file.path,
            type: file.mimetype,
            submissionID: submission.ID
        })
    ));

    await archiveProject((request as FileUploadRequest).fileLocation!, request.body["project"]);
    await deleteNonCodeFiles(files);

    response.send(submission);
}));

/**
 * Get submissions of a user
 */
submissionRouter.get('/user/:userID', capture(async(request: Request, response: Response) => {
    const userID : string = request.params.userID;
    const submissions : Submission[] = await SubmissionDB.getUserSubmissions(userID);
    response.status(200).send(submissions);
}));

/**
 * Get a specific submission
 */
submissionRouter.get('/:submissionID', capture(async(request: Request, response: Response) => {
    const submissionID : string = request.params.submissionID;
    const submission : Submission = await SubmissionDB.getSubmissionById(submissionID);
    response.status(200).send(submission);
}));