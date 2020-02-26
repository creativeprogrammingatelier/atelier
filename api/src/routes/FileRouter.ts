/**
 * Api routes relating to file information
 *
 * /api/file/fileId
 *  - text (no json)
 */

import express from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import {FileDB} from "../database/FileDB";
import { readFile } from '../helpers/FilesystemHelper';

export const fileRouter = express.Router();

// Authentication is required for all endpoints
fileRouter.use(AuthMiddleware.requireAuth);

fileRouter.get('/:fileID', async (request, response) => {
    const fileID = request.params.fileID;
    
    try {
        const file = await FileDB.getFileByID(fileID);
        response.status(200).send(file);
    } catch (e) {
        response.status(404).send({error:'file not found'})
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