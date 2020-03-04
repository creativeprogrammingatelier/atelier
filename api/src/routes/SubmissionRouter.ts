/**
 * Api routes relating to submission information
 */

import express, {Response, Request} from 'express';
import {SubmissionDB} from "../database/SubmissionDB";
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
 */
submissionRouter.get('/course/:courseID',
    (request: Request, result: Response) => {
        const courseID = request.params.courseID;
        SubmissionDB.getSubmissionsByCourse(courseID)
            .then((submissions : Submission[]) => {
                result.send(submissions);
            })
            .catch((error: any) => result.status(500).send({error: error}));
    });

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

/** Get submissions of a user
 * @type get
 * @url: /api/submissions/:userID
 * @param userID : id of the user
 * @param limit? : limit to submissions in the body
 * @return submissions of a user
 */
submissionRouter.get('/user/:userID',
    (request: Request, result: Response) => {
        const userID : string = request.params.userID;
        const limit : number | undefined = request.body.limit;

        SubmissionDB.getUserSubmissions(userID, limit)
            .then((data: Submission[]) => {
                result.send(data);
            })
            .catch((error : any) => result.status(500).send({error : error}));
    });

submissionRouter.get('/:submissionID', (request: Request, response: Response) => {
    SubmissionDB.getSubmissionById(request.params.submissionID)
        .then((data: Submission) => {response.send(data);})
        .catch((error : any) => response.status(500).send({error : error}));
});
