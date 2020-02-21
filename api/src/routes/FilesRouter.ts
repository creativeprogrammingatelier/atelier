import express, {Request, Response} from "express";
import SubmissionHelper from "../database/SubmissionHelper";
import FileHelper from "../database/FileHelper";
import ThreadHelper from "../database/ThreadHelper";
import {submissionsRouter} from "./SubmissionsRouter";

export const filesRouter = express.Router();

/** Get a files from a submission
 * @type: get
 * @url: /api/files/submission/:submissionId
 * @param submissionId (string) : id of the submission
 * @return Submission or 404
 */
filesRouter.get('/submission/:submissionID',
    async (request: Request, result: Response) => {
        const submissionID: string = request.params.submissionID;

        FileHelper.getFilesBySubmission(submissionID)
            .then((files : File[]) => result.send(files))
            .catch((error : any) => result.status(500).send({error: error}));
    });