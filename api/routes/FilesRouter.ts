/**
 * Routes for request relating to Files
 * 
 * @Author Andrew Heath
 */



var multer = require('multer');
var express = require('express');
var upload = multer({
    dest: 'uploads/'
})

var router = express.Router();

import AuthMiddlware from "../middleware/AuthMiddleware";
import UserMiddleware from "../middleware/UsersMiddleware";
import FilesMiddleware from "../middleware/FilesMiddleware";
import {Response, Request} from "express";
import { IUser } from "../models/user";
import { IFile } from "../models/file";
import path from "path";
import PermissionsMiddleware from "../middleware/PermissionsMiddleware";
/**
 * Upload file end point, uses multer to read file
 * @TODO refactor
 */
router.put('/', AuthMiddlware.withAuth, upload.single('file'),
    (request: any, result: Response) => {
        let file = request.file;
        UserMiddleware.getUser(request, 
            (user: IUser) => { FilesMiddleware.createFile(file.originalname, file.path, user,
                ()=>  result.status(200).send("File Uploaded"),
                (error: Error) => {console.error(error); result.status(500).send('Error Uploading File')})},
            (error: Error) => result.status(500).send('Error Uploading File'));
})
/**
 * End point to fetch all files belonging to a user
 * @TODO implement a selected number of files to fetch possible pagination 
 */
router.get('/', AuthMiddlware.withAuth, (request: Request, result: Response) => {
    UserMiddleware.getUser(request, (user: IUser) => {
        FilesMiddleware.getFiles(user.id, (files:any ) => result.status(200).send(files), (error: Error) => result.status(500).send(error));
        }, (error: Error) => result.status(500).send(error))
});

router.get('/user/:userId', AuthMiddlware.withAuth, AuthMiddlware.isTa, (request: Request, result: Response)=>{
    const studentId = request.params.uesrId;
    FilesMiddleware.getFiles(studentId, (files: any) => result.status(200).send(files), (error: Error) => result.status(500).send(error));
});


/**
 * End point pint to delete a file with a given ID
 * @TODO check user has permissions required to delete files
 */
router.delete('/', AuthMiddlware.withAuth, (request: Request, result: Response) => {
    FilesMiddleware.deleteFile(request.query.fileId, () => result.status(200).send(), (error: Error) => result.status(500).send(error));
})

/**
 * End point to read file from disk with given ID 
 * @TODO Refactor, far too nested 
 */
router.get('/:studentId', AuthMiddlware.withAuth, (request : Request, result: Response) => {
    const fileId = request.params.studentId;
    PermissionsMiddleware.checkFileAccessPermissionWithId(fileId, request, 
        (file: IFile) => {
            FilesMiddleware.readFileFromDisk(file, path.join(`${__dirname}../../${file.path}`), 
                (fileWithData: any) => {result.status(200).json(fileWithData)},
                (error: Error)=> {console.error(error); result.status(500).send("error")}
            )
        },
        () => {result.status(401).send()},
        (error : Error) => {
            console.error(error);
            result.status(500).send("Error");
        }
    );
});
/**
 * Download file given a ID
 * @TODO check if user has permission to view file
 */
router.get('/:studentId/download', AuthMiddlware.withAuth, (request: Request, result: Response) => {
    const fileId = request.params.studentId;
    PermissionsMiddleware.checkFileAccessPermissionWithId(fileId, request, 
        (file: IFile) => {
            const filepath = `${__dirname}../../${file.path}`;
            result.download(filepath); 
        },
        () => {result.status(401).send()},
        (error :Error) => {console.error(error), result.status(500).send(error)}
    );
});
module.exports = router;