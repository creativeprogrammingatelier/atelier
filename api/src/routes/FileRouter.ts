/**
 * Api routes relating to file information
 *
 * /api/file/fileId
 *  - text (no json)
 */

import express, {Request, Response} from 'express';
import path from 'path'
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { FileDB } from "../database/FileDB";
import { readFile } from '../helpers/FilesystemHelper';

export const fileRouter = express.Router();

// Authentication is required for all endpoints
fileRouter.use(AuthMiddleware.requireAuth);

fileRouter.get('/:fileID', async (request, response) => {
    const fileID = request.params.fileID;
    try {
        const file = await FileDB.getFileByID(fileID);
        if (file !== undefined) {
            response.status(200).send(file);
        } else {
            response.status(404).send({ error: "notfound", message: "The file you requested does not exist." });
        }
    } catch (err) {
        response.status(500).send(); // This is not guaranteed to be JSON, so no error
    }
});

fileRouter.get('/:fileID/body', async (request, response) => {
    const fileID = request.params.fileID;
    try {
        const file = await FileDB.getFileByID(fileID);
        const fileBody = await readFile(file.pathname!);
        response.status(200).set('Content-Type', file.type!).send(fileBody);
    } catch (err) {
        response.status(500).send(); // This is not guaranteed to be JSON, so no error
    }
});

/** Get a files from a submission
 * @type: get
 * @url: /api/files/submission/:submissionId
 * @param submissionId (string) : id of the submission
 * @return Submission or 404
 */
fileRouter.get('/submission/:submissionID',
    async (request: Request, result: Response) => {
        const submissionID: string = request.params.submissionID;

        FileDB.getFilesBySubmission(submissionID)
            .then((files : any) => result.send(files))
            .catch((error : any) => result.status(500).send({error: error}));
});

fileRouter.get('/:fileID/download', async (request, response) => {
    const fileID = request.params.fileID;
    try {
        const file = await FileDB.getFileByID(fileID);
        const fileBody = await readFile(file.pathname!);
        response.status(200)
            .set('Content-Type', file.type!)
            .set('Content-Disposition', `attachment; filename="${path.basename(file.pathname!)}"`)
            .send(fileBody);
    } catch (err) {
        response.status(500).send(); // This is not guaranteed to be JSON, so no error
    }
})