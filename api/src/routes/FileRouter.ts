/** Api routes relating to file information */

import express from 'express';
import path from 'path'
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { FileDB } from "../database/FileDB";
import { readFile } from '../helpers/FilesystemHelper';
import { handleError } from '../helpers/ErrorHelper';

export const fileRouter = express.Router();

// Authentication is required for all endpoints
fileRouter.use(AuthMiddleware.requireAuth);

/** Get information of type `File` about a file */
fileRouter.get('/:fileID', async (request, response, next) => {
    const fileID = request.params.fileID;
    try {
        const file = await FileDB.getFileByID(fileID);
        if (file !== undefined) {
            response.status(200).send(file);
        } else {
            response.status(404).send({ error: "notfound", message: "The file you requested does not exist." });
        }
    } catch (err) {
        handleError(err, next);
    }
});

/** Get a list of files related to a submission */
fileRouter.get('/submission/:submissionID', async (request, response, next) => {
    const submissionID: string = request.params.submissionID;
    try {
        const files = await FileDB.getFilesBySubmission(submissionID);
        response.status(200).send(files);
    } catch (err) {
        handleError(err, next);
    }
});

/** 
 * Get the contents of a file as the body of the response,
 * the Content-Type will be equivalent to the type of the file
 */
fileRouter.get('/:fileID/body', async (request, response, next) => {
    const fileID = request.params.fileID;
    try {
        const file = await FileDB.getFileByID(fileID);
        if (file !== undefined) {
            const fileBody = await readFile(file.pathname!);
            response.status(200).set('Content-Type', file.type!).send(fileBody);
        } else {
            response.status(404).send({ error: "notfound", message: "The file you requested does not exist." });
        }
    } catch (err) {
        handleError(err, next);
    }
});

/**
 * Similar to /body, but with the Content-Disposition set to attachment,
 * so the browser will know to present a Save dialog
 */
fileRouter.get('/:fileID/download', async (request, response, next) => {
    const fileID = request.params.fileID;
    try {
        const file = await FileDB.getFileByID(fileID);
        if (file !== undefined) {
            const fileBody = await readFile(file.pathname!);
            response.status(200)
                .set('Content-Type', file.type!)
                .set('Content-Disposition', `attachment; filename="${path.basename(file.pathname!)}"`)
                .send(fileBody);
        } else {
            response.status(404).send({ error: "notfound", message: "The file you requested does not exist." });
        }
    } catch (err) {
        handleError(err, next);
    }
})