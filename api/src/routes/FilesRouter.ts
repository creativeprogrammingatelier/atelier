import express, { Response, Request } from 'express';
import multer from 'multer';
import path from 'path';

import { projectStorageEngine, FileUploadRequest, readFileAsString, archiveProject, deleteNonCodeFiles } from '../helpers/FilesystemHelper';
import RoutesHelper from '../helpers/RoutesHelper';
import AuthMiddleware from '../middleware/AuthMiddleware';
import UserMiddleware from '../middleware/UsersMiddleware';
import FilesMiddleware from '../middleware/FilesMiddleware';
import PermissionsMiddleware from '../middleware/PermissionsMiddleware';

import { IUser } from '../../../models/user';
import { IFile } from '../../../models/file';

const upload = multer({
    preservePath: true,
    storage: projectStorageEngine
});

export const router = express.Router();

/** Upload a list of files that are part of a single project
 */   
router.put('/', AuthMiddleware.withAuth, upload.array('files'), 
    async (request: FileUploadRequest, result: Response) => {
        // TODO: Fix error handling in here, it's terrible
        const files = request.files as Express.Multer.File[];

        const zipFile = await archiveProject(request.fileLocation!, request.body["project"]);
        await deleteNonCodeFiles(files);

        UserMiddleware.getUser(request,
            (user: IUser) => {
                // TODO: Use actual project structure to store this
                FilesMiddleware.createFile(path.basename(zipFile), zipFile, user,
                    () => {},
                    (err: Error) => console.log(err));

                for (const file of files.filter(f => path.extname(f.filename) === ".pde")) {
                    FilesMiddleware.createFile(file.filename, file.path, user,
                        () => {},
                        (err: Error) => console.log(err));
                }
            },
            (_: Error) => result.status(500).send("Error Uploading Folder"));
        
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
        readFileAsString(file.path)
            .then(data => response.status(200).send({id: file.id, name: file.name, body: data}))
            .catch((error: Error) => {
                console.error(error); 
                response.status(500).send();
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
			readFileAsString(file.path)
				.then(data => response.status(200).json({...file, body: data}))
				.catch((error: Error) => {
					console.error(error);
					response.status(500).send('error');
				});
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
			readFileAsString(file.path)
				.then(data => response.status(200).json({...file, body: data}))
				.catch((error: Error) => {
					console.error(error);
					response.sendStatus(500);
				});
		},
		(error: Error) => {
			console.error(error), response.status(500).send(error);
		}
	);
});