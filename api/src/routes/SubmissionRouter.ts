/**
 * Api routes relating to submission information
 */

import express, {Response, Request} from 'express';
import {SubmissionDB} from "../database/SubmissionDB";
<<<<<<< HEAD
import {Submission} from "../../../models/api/Submission";
import {UUIDHelper} from "../helpers/UUIDHelper";
import {capture} from "../helpers/ErrorHelper";

export const submissionRouter = express.Router();

/**
 * Get submissions of a course
=======
import {Submission} from "../../../models/database/Submission";
import { capture } from '../helpers/ErrorHelper';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { archiveProject, deleteNonCodeFiles, FileUploadRequest, uploadMiddleware } from '../helpers/FilesystemHelper';
import { validateProjectServer } from '../../../helpers/ProjectValidationHelper';
import { getCurrentUserID } from '../helpers/AuthenticationHelper';
import { FileDB } from '../database/FileDB';

export const submissionRouter = express.Router();

submissionRouter.use(AuthMiddleware.requireAuth);

/** Get submissions of a course
 * @type: get
 * @url: /api/submissions/course/:courseId
 * @return: submissions of a certain course
>>>>>>> 8030ef3ef0591383cc8f8e6e9fc0ef2e08c39209
 */
submissionRouter.get('/course/:courseID', capture(async(request: Request, response: Response) => {
    const courseID : string = request.params.courseID;
    const submissions : Submission[] = await SubmissionDB.getSubmissionsByCourse(courseID);
    response.status(200).send(submissions);
}));

/** Create a new submission containing the files submitted in the body of the request */
submissionRouter.post('/course/:courseID', uploadMiddleware.array('files'), capture(async (request, response) => {
    const files = request.files as Express.Multer.File[];
    validateProjectServer(request.body["project"], files);
    const userID = await getCurrentUserID(request);

    // TODO: create a single transaction, including filesystem things
    const submission = await SubmissionDB.addSubmission({ 
        name: request.body["project"], 
        courseID: request.params.courseID, 
        userID 
    });

    await Promise.all(files.map(file => 
        FileDB.addFile({
            pathname: file.path,
            type: file.mimetype,
            submissionID: submission.submissionID
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

<<<<<<< HEAD
/**
 * Get a specific submission
 */
submissionRouter.get('/:submissionID', capture(async(request: Request, response: Response) => {
    const submissionID : string = request.params.submissionID;
    const submission : Submission = await SubmissionDB.getSubmissionById(submissionID);
    response.status(200).send(submission);
}));

/**
 * Create a new submission.
 */
submissionRouter.post('/', capture(async(request: Request, response: Response) => {
    // TODO getUserID, name
    // TODO create transaction for adding a submission: submission, files etc.
    response.status(200).send({});
}));

=======
submissionRouter.get('/:submissionID', (request: Request, response: Response) => {
    SubmissionDB.getSubmissionById(request.params.submissionID)
        .then((data: Submission) => {response.send(data);})
        .catch((error : any) => response.status(500).send({error : error}));
});
>>>>>>> 8030ef3ef0591383cc8f8e6e9fc0ef2e08c39209
