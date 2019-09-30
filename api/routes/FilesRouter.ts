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
/**
 * Upload file end point, uses multer to read file
 * @TODO refactor
 */
router.post('/uploadfile', AuthMiddlware.withAuth, upload.single('file'),
    (request: any, result: Response, next: Function) => {
        try {
            let file = request.file;
            UserMiddleware.getUser(request, (user: IUser) => {
                FilesMiddleware.createFile(file.originalname, file.path, user,()=>  result.status(200).send("File Uploaded"), () => result.status(500).send('Error Uploading File'));
            }, () => result.status(500).send('Error Uploading File'));
            } catch (error) {
            console.log(`File Uploading error has occured: ${error}`), result.status(500).send('Error Uploading File');
        }
    })
/**
 * End point to fetch all files belonging to a user
 * @TODO implement a selected number of files to fetch possible pagination 
 */
router.get('/getfiles', AuthMiddlware.withAuth, (request: Request, result: Response) => {
    UserMiddleware.getUser(request, (user: IUser) => {
        FilesMiddleware.getFiles(user.id, (files:any ) => result.status(200).send(files), (error: Error) => result.status(500).send(error));
        }, (error: Error) => result.status(500).send(error))
});

router.get('/getStudentFiles', AuthMiddlware.withAuth, AuthMiddlware.isTa, (request: Request, result: Response)=>{
    const studentId = request.query.studentId;
    FilesMiddleware.getFiles(studentId, (files: any) => result.status(200).send(files), (error: Error) => result.status(500).send(error));
});


/**
 * End point pint to delete a file with a given ID
 * @TODO check user has permissions required to delete files
 */
router.delete('/deletefile', AuthMiddlware.withAuth, (request: Request, result: Response) => {
    FilesMiddleware.deleteFile(request.query.fileId, () => result.status(200).send(), (error: Error) => result.status(500).send(error));
})

/**
 * End point to read file from disk with given ID 
 * @TODO Refactor, far too nested 
 */
router.get('/getfile', AuthMiddlware.withAuth, (request : Request, result: Response) => {
    const fileId = request.query.fileId;
    FilesMiddleware.getFile(fileId, (files: IFile[]) => {
        UserMiddleware.getUser(request, (user: IUser, request : Request) => {
            let file = files[0];
            if (user.id == file.owner || user.role == "ta") {
                let pathToFile = path.join(`${__dirname}../../${file.path}`);
                try {
                    FilesMiddleware.readFile(pathToFile, (fileData: any) => {
                        let returnFile = {
                            name: file.name,
                            body: fileData,
                            id: file._id
                        };
                        result.status(200).json(returnFile);
                    },(error: Error)=> result.status(500).send("error"));
                } catch (error) {
                    result.status(500).send("error");
                }
            } else {
                result.status(401).send("You are not the file owner");
            }
        },(error: Error) => result.status(500).send(error))
    },(error : Error) => {
        result.status(500).send("Error");
    });
});
/**
 * Download file given a ID
 * @TODO check if user has permission to view file
 */
router.get('/downloadfile', (request: Request, result: Response) => {
    const fileId = request.query.fileId;
    FilesMiddleware.getFilePath(fileId).then((files:IFile[]) =>  {
        let file = files[0];
        const filepath = `${__dirname}../../${file.path}`;
        result.download(filepath);
    }).catch(error => result.status(500).send(error))
});
module.exports = router;