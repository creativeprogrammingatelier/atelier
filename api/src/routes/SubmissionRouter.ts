/**
 * Api routes relating to submission information
 */

import express, {Request, Response} from 'express';
import {SubmissionDB} from "../database/SubmissionDB";
import {Submission} from "../../../models/api/Submission";
import {capture} from "../helpers/ErrorHelper";
import {AuthMiddleware} from '../middleware/AuthMiddleware';
import {archiveProject, deleteNonCodeFiles, FileUploadRequest, uploadMiddleware} from '../helpers/FilesystemHelper';
import {validateProjectServer} from '../../../helpers/ProjectValidationHelper';
import {getCurrentUserID} from '../helpers/AuthenticationHelper';
import {FileDB} from '../database/FileDB';
import {CODEFILE_EXTENSIONS} from '../../../helpers/Constants';
import path from 'path';
import {raiseWebhookEvent} from '../helpers/WebhookHelper';
import {filterSubmission} from "../helpers/APIFilterHelper";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {requirePermission, requireRegistered} from "../helpers/PermissionHelper";
import { transaction } from '../database/HelperDB';

export const submissionRouter = express.Router();
submissionRouter.use(AuthMiddleware.requireAuth);

/**
 * Get submissions of a course
 */
submissionRouter.get('/course/:courseID', capture(async(request: Request, response: Response) => {
    const userID : string = await getCurrentUserID(request);
    const courseID : string = request.params.courseID;

    // Requires registration in the course
    await requireRegistered(userID, courseID);

    let submissions : Submission[] = await SubmissionDB.getSubmissionsByCourse(courseID);
    submissions = await filterSubmission(submissions, userID);

    response.status(200).send(submissions);
}));

/**
 * Create a new submission containing the files submitted in the body of the request
 */
submissionRouter.post('/course/:courseID', uploadMiddleware.array('files'), capture(async (request, response) => {
    const files = request.files as Express.Multer.File[];
    validateProjectServer(request.body["project"], files);
    const userID = await getCurrentUserID(request);

    const { submission, dbFiles } = await transaction(async client => {
        const submission = await SubmissionDB.addSubmission({ 
            title : request.body["project"],
            courseID: request.params.courseID, 
            userID,
            client
        });
        
        const dbFiles = await Promise.all(
            files.map(file => 
                FileDB.addFile({
                    pathname: file.path,
                    type: file.mimetype,
                    submissionID: submission.ID,
                    client
                }))
        );
                
        await archiveProject((request as FileUploadRequest).fileLocation!, request.body["project"]);
        await deleteNonCodeFiles(files);

        return { submission, dbFiles };
    });
                
    response.send(submission);

    await Promise.all(
        dbFiles
            .filter(f => CODEFILE_EXTENSIONS.includes(path.extname(f.name)))
            .map(file => raiseWebhookEvent("submission.file", file))
    );
}));

/**
 * Get submissions of a user
 * - requirements:
 *  - view all submissions permission
 */
submissionRouter.get('/user/:userID', capture(async(request: Request, response: Response) => {
    const userID : string = request.params.userID;
    const currentUserID : string = await getCurrentUserID(request);

    // Requires view all submission permission if you are not the user
    if (userID !== currentUserID) await requirePermission(currentUserID, PermissionEnum.viewAllSubmissions);

    const submissions : Submission[] = await SubmissionDB.getUserSubmissions(userID);
    response.status(200).send(submissions);
    // TODO: Error handling
}));
/**
 * Get submissions of a user within a course
 */
submissionRouter.get('/course/:courseID/user/:userID', capture(async(request: Request, response: Response) => {
    const courseID = request.params.courseID;
    const userID = request.params.userID;
    const submissions : Submission[] = await SubmissionDB.getRecents({userID, courseID});
    response.status(200).send(submissions);
    // TODO: Error handling
}));

/**
 * Get a specific submission
 */
submissionRouter.get('/:submissionID', capture(async(request: Request, response: Response) => {
    const submissionID : string = request.params.submissionID;
    const currentUserID : string = await getCurrentUserID(request);

    const submission : Submission = await SubmissionDB.getSubmissionById(submissionID);

    // Requires registration in the course
    await requireRegistered(currentUserID, submission.references.courseID);

    response.status(200).send(submission);
}));