import express from "express";
import path from "path";

import {File} from "../../../models/api/File";

import {capture} from "../helpers/ErrorHelper";
import {readFile, getFilePathOnDisk} from "../helpers/FilesystemHelper";

import {FileDB} from "../database/FileDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";

/**
 * Api routes relating to file information
 */

export const fileRouter = express.Router();
fileRouter.use(AuthMiddleware.requireAuth);

/** Get information of type `File` about a file */
fileRouter.get("/:fileID", capture(async (request, response) => {
    const fileID: string = request.params.fileID;
    const file: File = await FileDB.getFileByID(fileID);
    response.status(200).send(file);
}));

/** Get a list of files related to a submission */
fileRouter.get("/submission/:submissionID", capture(async (request, response) => {
    const submissionID: string = request.params.submissionID;
    const files: File[] = await FileDB.getFilesBySubmission(submissionID);
    response.status(200).send(files);
}));

/**
 * Get the contents of a file as the body of the response,
 * the Content-Type will be equivalent to the type of the file
 */
fileRouter.get("/:fileID/body", capture(async (request, response) => {
    const fileID: string = request.params.fileID;
    const file: File = await FileDB.getFileByID(fileID);
    const fileBody: Buffer = await readFile(getFilePathOnDisk(file));
    response.status(200).set("Content-Type", file.type).send(fileBody);
}));

/**
 * Similar to /body, but with the Content-Disposition set to attachment,
 * so the browser will know to present a Save dialog
 */
fileRouter.get("/:fileID/download", capture(async (request, response) => {
    const fileID: string = request.params.fileID;
    const file: File = await FileDB.getFileByID(fileID);
    const fileBody: Buffer = await readFile(getFilePathOnDisk(file));
    response.status(200)
        .set("Content-Type", file.type)
        .set("Content-Disposition", `attachment; filename="${path.basename(file.name)}"`)
        .send(fileBody);
}));
