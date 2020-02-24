/**
 * Api routes relating to file information
 *
 * /api/file/fileId
 *  - text (no json)
 */

import express, { Response, Request } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import {File} from "../../../models/File";
import {FileDB} from "../database/FileDB";
const fs = require('fs');

export const fileRouter = express.Router();

// Authentication is required for all endpoints
fileRouter.use(AuthMiddleware.requireAuth);

fileRouter.get('/:fileID',
    async (request : Request, result : Response) => {
        const fileID = request.params.fileID;

        const file : File = await FileDB.getFileByID(fileID);

        try {
                // Get path for file, and load it as string
                const pathname = "./uploads/" + file.pathname! + '.' + file.type!;
                const fileBody = fs.readFileSync(pathname).toString();

                result.send({
                        ...file,
                        body : fileBody
                })
        } catch (e) {
                result.status(404).send({error:'file not found'})
        }
});
