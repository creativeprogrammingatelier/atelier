/**
 * Api routes relating to submission information
 */

import express, {Request, Response} from 'express';
import {SubmissionDB} from '../database/SubmissionDB';
import {Submission} from '../../../models/api/Submission';
import {capture} from '../helpers/ErrorHelper';
import {AuthMiddleware} from '../middleware/AuthMiddleware';
import {archiveProject, FileUploadRequest, uploadMiddleware, renamePath, readFile, deleteFolder} from '../helpers/FilesystemHelper';
import {validateProjectServer} from '../../../helpers/ProjectValidationHelper';
import {AuthError, getCurrentUserID} from '../helpers/AuthenticationHelper';
import {FileDB} from '../database/FileDB';
import path from 'path';
import {raiseWebhookEvent} from '../helpers/WebhookHelper';
import {filterSubmission, removePermissionsSubmission} from '../helpers/APIFilterHelper';
import {PermissionEnum} from '../../../models/enums/PermissionEnum';
import {PermissionError, requirePermission, requireRegistered} from '../helpers/PermissionHelper';
import {transaction} from '../database/HelperDB';
import {WebhookEvent} from '../../../models/enums/WebhookEventEnum';
import {UPLOADS_PATH} from '../lib/constants';
import {getProperType} from '../helpers/FileHelper';

export const submissionRouter = express.Router();
submissionRouter.use(AuthMiddleware.requireAuth);

/**
 * Get submissions of a course
 */
submissionRouter.get('/course/:courseID', capture(async (request: Request, response: Response) => {
    const userID: string = await getCurrentUserID(request);
    const courseID: string = request.params.courseID;

    // Requires registration in the course
    await requireRegistered(userID, courseID);

    let submissions: Submission[] = await SubmissionDB.getSubmissionsByCourse(courseID);
    submissions = (await filterSubmission(submissions, userID))
        .map(submission => removePermissionsSubmission(submission));
    response.status(200).send(submissions);
}));

/**
 * Get submissions of a user
 * - requirements:
 *  - view all submissions permission
 */
submissionRouter.get('/user/:userID', capture(async (request: Request, response: Response) => {
    const userID: string = request.params.userID;
    const currentUserID: string = await getCurrentUserID(request);

    // Requires view all submission permission if you are not the user
    if (userID !== currentUserID) await requirePermission(currentUserID, PermissionEnum.viewAllSubmissions);

    const submissions: Submission[] = (await SubmissionDB.getUserSubmissions(userID))
        .map(submission => removePermissionsSubmission(submission));
    response.status(200).send(submissions);
}));

/**
 * Get submissions of a user within a course
 */
submissionRouter.get('/course/:courseID/user/:userID', capture(async (request: Request, response: Response) => {
    const courseID = request.params.courseID;
    const userID = request.params.userID;
    const currentUserID: string = await getCurrentUserID(request);

    // Requires enrolled in the course & view all permissions if you are not the user
    await requireRegistered(currentUserID, courseID);
    if (userID !== currentUserID) await requirePermission(currentUserID, PermissionEnum.viewAllSubmissions, courseID);

    const submissions: Submission[] = (await SubmissionDB.getRecents({userID, courseID}))
        .map(submission => removePermissionsSubmission(submission));
    response.status(200).send(submissions);
}));

/**
 * Get a specific submission
 */
submissionRouter.get('/:submissionID', capture(async (request: Request, response: Response) => {
    const submissionID: string = request.params.submissionID;
    const currentUserID: string = await getCurrentUserID(request);

    const submission: Submission = await SubmissionDB.getSubmissionById(submissionID);

    // Requires registration in the course
    await requireRegistered(currentUserID, submission.references.courseID);

    response.status(200).send(removePermissionsSubmission(submission));
}));

/** Get the archive for a specific submission */
submissionRouter.get('/:submissionID/archive', capture(async (request, response) => {
    const submission = await SubmissionDB.getSubmissionById(request.params.submissionID);
    const currentUserID = await getCurrentUserID(request);
    await requireRegistered(currentUserID, submission.references.courseID);

    const zipFileName = path.join(UPLOADS_PATH, submission.ID, submission.name + ".zip");
    const fileBody: Buffer = await readFile(zipFileName);

    response.status(200)
        .set("Content-Type", "application/zip")
        .set("Content-Disposition", `attachment; filename="${path.basename(zipFileName)}"`)
        .send(fileBody);
}));

/**
 * Create a new submission containing the files submitted in the body of the request
 */
submissionRouter.post('/course/:courseID', uploadMiddleware.array('files'), capture(async (request, response) => {
    const userID = await getCurrentUserID(request);
    await requireRegistered(userID, request.params.courseID);

    const files = request.files as Express.Multer.File[];
    const fileLocation = (request as FileUploadRequest).fileLocation!;
    validateProjectServer(request.body["project"], files);

    const {submission, dbFiles} = await transaction(async client => {
        const submission = await SubmissionDB.addSubmission({
            title: request.body["project"],
            courseID: request.params.courseID,
            userID
        }, client);

        const oldPath = path.join(UPLOADS_PATH, fileLocation);

        const dbFiles = await Promise.all(
            files.map(file =>
                FileDB.addFile({
                    pathname: file.path.replace(oldPath, "").replace(/\\/g, "/"),
                    type: getProperType(file.mimetype, file.path),
                    submissionID: submission.ID,
                    client
                }))
        );

        await renamePath(oldPath, path.join(UPLOADS_PATH, submission.ID));
        await archiveProject(submission.ID, request.body["project"]);

        return {submission: {...submission, files: dbFiles} as Submission, dbFiles};
    });

    response.send(submission);

    await Promise.all(
        dbFiles.map(file => raiseWebhookEvent(request.params.courseID, WebhookEvent.SubmissionFile, file))
            .concat(raiseWebhookEvent(request.params.courseID, WebhookEvent.Submission, submission))
    );
}));

/**
 * Delete a submission. Currently this can only be done by the admin.
 */
submissionRouter.delete('/:submissionID', capture(async(request, response) => {
    const submissionID = request.params.submissionID;
    let submission = await SubmissionDB.getSubmissionById(submissionID);
    const currentUserID = await getCurrentUserID(request);

    // TODO add permission manageSubmissions to also allow admins to delete submissions for example
    if (submission.user.ID !== currentUserID) {
        throw new PermissionError("permission.notOwner", "You are not the owner of this submissions.");
    }

    transaction(async client => {
        submission = await SubmissionDB.deleteSubmission(submissionID, client);
        await deleteFolder(path.join(UPLOADS_PATH, submissionID));
        response.status(200).send(submission);
    });
}));