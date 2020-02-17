/**
 * Routes for request relating to Files
 *
 * @Author Andrew Heath
 */

import multer from 'multer';

type FileUploadRequest = Request & { fileLocation?: string };

var express = require('express');
var upload = multer({
    preservePath: true,
    storage: multer.diskStorage({
        destination: (req: FileUploadRequest, file, callback) => {
            if (req.fileLocation === undefined) {
                req.fileLocation = randomBytes(16).toString('hex');
            }
            const folder = path.join("uploads", req.fileLocation,  
                path.dirname(file.originalname) !== "." 
                ? path.dirname(file.originalname)
                : req.body["project"]);
            fs.mkdir(folder, { recursive: true }, () => callback(null, folder));
        },
        filename: (_, file, callback) => {
            callback(null, path.basename(file.originalname));
        }
    })
});

var router = express.Router();

import AuthMiddleware from '../middleware/AuthMiddleware';
import UserMiddleware from '../middleware/UsersMiddleware';
import FilesMiddleware from '../middleware/FilesMiddleware';
import {Response, Request} from 'express';
import {IUser} from '../../../models/user';
import {IFile} from '../../../models/file';
import path from 'path';
import PermissionsMiddleware from '../middleware/PermissionsMiddleware';
import fs, {PathLike, MakeDirectoryOptions} from 'fs';
import RoutesHelper from '../helpers/RoutesHelper';
import { randomBytes } from 'crypto';

/** Upload a list of files that are part of a single project
 */   
router.put('/', AuthMiddleware.withAuth, upload.array('files'), 
    (request: FileUploadRequest, result: Response) => {
        const files = request.files as Express.Multer.File[];
        UserMiddleware.getUser(request,
            (user: IUser) => {
                // TODO: Use actual project structure to store this
                for (const file of files) {
                    FilesMiddleware.createFile(file.filename, file.path, user,
                        () => {},
                        (err: Error) => console.log(err));
                }
            },
            (_: Error) => result.status(500).send("Error Uploading Folder"));
        // TODO: Create Zip file of project and only keep the .pde files
        result.status(200).send();
    })

/**
 * End point to fetch all files belonging to the user making the request
 * @TODO implement a selected number of files to fetch possible pagination
 */
router.get('/', AuthMiddleware.withAuth, (request: Request, result: Response) => {
	UserMiddleware.getUser(request, (user: IUser) => {
		FilesMiddleware.getFiles(user.id, (files: IFile[]) => result.status(200).send(files), (error: Error) => result.status(500).send(error));
	}, (error: Error) => result.status(500).send(error));
});

router.get('/:fileId', AuthMiddleware.withAuth, PermissionsMiddleware.checkFileWithId, (request: Request, response: Response) => {
	const fileId = RoutesHelper.getValueFromParams('fileId', request, response);
	FilesMiddleware.getFile(fileId, (file: IFile) => {
		FilesMiddleware.readFileFromDisk(file, (fileFromDisk: any) => {
			let fileWithBody = {id: file.id, name: file.name, body: fileFromDisk.body};
			response.status(200).send(fileWithBody);
		}, (error: Error) => {
			console.error(error), response.status(500).send();
		});
	}, (error: Error) => {
		console.error(error), response.status(500).send();
	});
});

router.get('/user/:userId', AuthMiddleware.withAuth, PermissionsMiddleware.isTa, (request: Request, result: Response) => {
	const userId = request.params.userId;
	FilesMiddleware.getFiles(userId, (files: IFile[]) => result.status(200).send(files), (error: Error) => result.status(500).send(error));
});


/**
 * End point pint to delete a file with a given ID
 * @TODO check user has permissions required to delete files
 */
router.delete('/:fileId', AuthMiddleware.withAuth, PermissionsMiddleware.checkFileWithId, (request: Request, response: Response) => {
	const fileId: string = RoutesHelper.getValueFromParams('fileId', request, response);
	FilesMiddleware.deleteFile(fileId, () => response.status(200).send(), (error: Error) => response.status(500).send(error));
});

/**
 * End point to read file from disk with given ID
 * @TODO Refactor, far too nested
 */
router.get('/:studentId', AuthMiddleware.withAuth, PermissionsMiddleware.checkFileWithId, (request: Request, response: Response) => {
	const fileId: string = RoutesHelper.getValueFromParams('fileId', request, response);
	FilesMiddleware.getFile(fileId,
		(file: IFile) => {
			FilesMiddleware.readFileFromDisk(file,
				(fileWithData: IFile) => {
					response.status(200).json(fileWithData);
				},
				(error: Error) => {
					console.error(error);
					response.status(500).send('error');
				}
			);
		},
		(error: Error) => {
			console.error(error);
			response.status(500).send('error');
		}
	);
});

/**
 * Download file given a ID
 * @TODO check if user has permission to view file
 */
router.get('/:fileId/download', AuthMiddleware.withAuth, PermissionsMiddleware.checkFileWithId, (request: Request, response: Response) => {
	const fileId: string = RoutesHelper.getValueFromParams('fileId', request, response);
	FilesMiddleware.getFile(fileId,
		(file: IFile) => {
			FilesMiddleware.readFileFromDisk(file,
				(fileWithData: IFile) => response.status(200).json(fileWithData),
				(error: Error) => {
					console.error(error);
					response.sendStatus(500);
				});
		},
		(error: Error) => {
			console.error(error), response.status(500).send(error);
		}
	);
});
module.exports = router;