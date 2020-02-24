import express, {Request, Response} from "express";
import {FileDB} from "../database/FileDB";

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

        FileDB.getFilesBySubmission(submissionID)
            .then((files : any) => result.send(files))
            .catch((error : any) => result.status(500).send({error: error}));
    });