/** Api routes relating to file information */

import express from 'express';
import path from 'path'
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { FileDB } from '../database/FileDB';
import { readFile } from '../helpers/FilesystemHelper';
import { capture } from '../helpers/ErrorHelper';
import { File } from '../../../models/api/File';
import { UPLOADS_PATH } from '../lib/constants';

export const fileRouter = express.Router();

// Authentication is required for all endpoints
fileRouter.use(AuthMiddleware.requireAuth);

function normalizePath(file: File): File {
    return { 
        ...file, 
        // Remove the uploads/random chars prefix from files
        name: 
            path.join(...path
                    .relative(UPLOADS_PATH, file.name)
                    .split(path.sep)
                    .slice(1))
                .replace(/\//g, "/")
    }
}

/** Get information of type `File` about a file */
fileRouter.get('/:fileID', capture(async (request, response) => {
    const fileID : string = request.params.fileID;
    const file : File = await FileDB.getFileByID(fileID);
    response.status(200).send(normalizePath(file));
}));

/** Get a list of files related to a submission */
fileRouter.get('/submission/:submissionID', capture(async (request, response) => {
    const submissionID: string = request.params.submissionID;
    const files : File[] = await FileDB.getFilesBySubmission(submissionID);
    response.status(200).send(files.map(normalizePath));
}));

/** 
 * Get the contents of a file as the body of the response,
 * the Content-Type will be equivalent to the type of the file
 */
fileRouter.get('/:fileID/body', capture(async (request, response) => {
    const fileID : string = request.params.fileID;
    const file : File = await FileDB.getFileByID(fileID);
    const fileBody : Buffer = await readFile(file.name);
    response.status(200).set("Content-Type", file.type).send(fileBody);
}));

/**
 * Similar to /body, but with the Content-Disposition set to attachment,
 * so the browser will know to present a Save dialog
 */
fileRouter.get('/:fileID/download', capture(async (request, response) => {
    const fileID: string = request.params.fileID;
    const file : File = await FileDB.getFileByID(fileID);
    const fileBody : Buffer = await readFile(file.name);
    response.status(200)
        .set("Content-Type", file.type!)
        .set("Content-Disposition", `attachment; filename="${path.basename(file.name!)}"`)
        .send(fileBody);
}));