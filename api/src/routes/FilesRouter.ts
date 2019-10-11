/**
 * Routes for request relating to Files
 * 
 * @Author Andrew Heath
 */



var multer = require('multer');
var express = require('express');
var upload = multer({
    dest: '../uploads/'
})

var router = express.Router();

import AuthMiddleware from "../middleware/AuthMiddleware";
import UserMiddleware from "../middleware/UsersMiddleware";
import FilesMiddleware from "../middleware/FilesMiddleware";
import {Response, Request} from "express";
import { IUser } from "../models/user";
import { IFile } from "../models/file";
import path from "path";
import PermissionsMiddleware from "../middleware/PermissionsMiddleware";
import fs, { PathLike } from "fs";
/**
 * Upload file end point, uses multer to read file
 * @TODO refactor
 */
router.put('/', AuthMiddleware.withAuth, upload.single('file'),
    (request: any, result: Response) => {
        let file = request.file;
        UserMiddleware.getUser(request, 
            (user: IUser) => { FilesMiddleware.createFile(file.originalname, file.path, user,
                ()=>  result.status(200).send("File Uploaded"),
                (error: Error) => {console.error(error); result.status(500).send('Error Uploading File')})},
            (error: Error) => result.status(500).send('Error Uploading File'));
})
/**
 * End point to fetch all files belonging to the user making the request
 * @TODO implement a selected number of files to fetch possible pagination 
 */
router.get('/', AuthMiddleware.withAuth, (request: Request, result: Response) => {
    UserMiddleware.getUser(request, (user: IUser) => {
        FilesMiddleware.getFiles(user.id, (files:IFile[] ) => result.status(200).send(files), (error: Error) => result.status(500).send(error));
        }, (error: Error) => result.status(500).send(error))
});

router.get('/:fileId', AuthMiddleware.withAuth, (request: Request, result: Response) => {
    const fileId = request.params.fileId;
    PermissionsMiddleware.checkFileWithId(fileId, request,
        () => {FilesMiddleware.getFile(fileId, (file: IFile ) => {
                FilesMiddleware.readFileFromDisk(file, (fileFromDisk: any)=>{
                     let fileWithBody  = { id: file.id, name: file.name, body: fileFromDisk.body}
                    result.status(200).send(fileWithBody);
                    } ,(error: Error) => result.status(500).send())
                },(error: Error) => result.status(500).send())
            },
        ()=> result.status(401).send(),
        () => result.status(500).send());
});

router.get('/user/:userId', AuthMiddleware.withAuth, AuthMiddleware.isTa, (request: Request, result: Response)=>{
    const userId = request.params.userId;
    FilesMiddleware.getFiles(userId, (files: any) => result.status(200).send(files), (error: Error) => result.status(500).send(error));
});


/**
 * End point pint to delete a file with a given ID
 * @TODO check user has permissions required to delete files
 */
router.delete('/:fileId', AuthMiddleware.withAuth, (request: Request, result: Response) => {
    PermissionsMiddleware.checkFileWithId(request.params.fileId, request,
        () =>  FilesMiddleware.deleteFile(request.params.fileId, () => result.status(200).send(), (error: Error) => result.status(500).send(error)),
        () => result.status(401).send(),
        () => result.status(500).send()
        )
})

/**
 * End point to read file from disk with given ID 
 * @TODO Refactor, far too nested 
 */
router.get('/:studentId', AuthMiddleware.withAuth, (request : Request, result: Response) => {
    const fileId = request.params.studentId;
    PermissionsMiddleware.checkFileWithId(fileId, request, 
        (file: IFile) => {
            FilesMiddleware.readFileFromDisk(file, 
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
router.get('/:fileId/download', AuthMiddleware.withAuth, (request: Request, result: Response) => {
    const fileId = request.params.fileId;
    PermissionsMiddleware.checkFileWithId(fileId, request, 
        (file: IFile) => {
            FilesMiddleware.readFileFromDisk(file, 
                (fileWithData:any )=> result.status(200).json(fileWithData), 
                (error: Error)=> {console.error(error); result.sendStatus(500)})
        },
        () => {result.status(401).send()},
        (error :Error) => {console.error(error), result.status(500).send(error)}
    );
});
module.exports = router;