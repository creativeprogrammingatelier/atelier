import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import archiver, { ArchiverError } from 'archiver';
import { randomBytes } from 'crypto';

import { UPLOADS_PATH } from '../lib/constants';
import { CODEFILE_EXTENSIONS } from '../../../helpers/Constants';

/** A version of `express.Request` that keeps the location where files are stored. */
export type FileUploadRequest = Request & { fileLocation?: string };

/**
 * Get the correct folder name for a file or project 
 * @param reqFileLocation foldername for all files in a request
 * @param projectName name of the project
 * @param fileName full path of the original file
 */
function getFolderForFile(reqFileLocation: string, projectName: string, fileName?: string) {
    return path.join(
        UPLOADS_PATH, 
        reqFileLocation,  
        fileName && path.dirname(fileName) !== "." ? path.dirname(fileName) : projectName
    );
}

/** 
 * Storage engine for `multer` that stores files of a request together in a folder. 
 * Storage structure: UPLOADS_PATH/[random string]/ProjectName/[all files]
 */
export const projectStorageEngine = multer.diskStorage({
    destination: (req: FileUploadRequest, file, callback) => {
        if (req.fileLocation === undefined) {
            req.fileLocation = randomBytes(16).toString('hex');
        }
        const folder = getFolderForFile(req.fileLocation, req.body["project"], file.originalname);
        fs.mkdir(folder, { recursive: true }, () => callback(null, folder));
    },
    filename: (_, file, callback) => {
        callback(null, path.basename(file.originalname));
    }
});

/**
 * Asynchronously archives the entire project into a single .zip file, returns the path to this file
 * @param reqFileLocation foldername for all files in a request
 * @param projectName name of the project
 */
export const archiveProject = (reqFileLocation: string, projectName: string) => 
    new Promise((resolve: (fileName: string) => void, reject: (error: ArchiverError) => void) => {
        const archive = archiver('zip', { zlib: { level: 7 } });
        const filesPath = getFolderForFile(reqFileLocation, projectName);
        const zipFileName = filesPath + ".zip";
        const output = fs.createWriteStream(zipFileName);

        output.on('close', () => resolve(zipFileName));

        archive.on('warning', err => {
            if (err.code === 'ENOENT') {
                // TODO: proper logging
                console.log(err);
            } else {
                reject(err);
            }
        });

        archive.on('error', err => reject(err));

        archive.pipe(output);
        archive.directory(filesPath, false);
        archive.finalize();
    });

/** Asynchronously delete a file */
export const deleteFile = (filePath: fs.PathLike): Promise<void> => 
    new Promise((resolve: () => void, reject: (err: NodeJS.ErrnoException) => void) => 
        fs.unlink(filePath, err => err ? reject(err) : resolve())
    );

/** Delete all non-code files from a list of files */
export async function deleteNonCodeFiles(files: Express.Multer.File[]) {
    const nonCodeFiles = files.filter(f => !CODEFILE_EXTENSIONS.includes(path.extname(f.filename)));
    for (const file of nonCodeFiles) {
        await deleteFile(file.path);
    }
}

/** Read a file as a string with UTF-8 encoding */
export const readFileAsString = (filePath: fs.PathLike) =>
    new Promise((resolve: (data: string) => void, reject: (err: NodeJS.ErrnoException) => void) => 
        fs.readFile(
            filePath, 
            { encoding: 'utf-8' },
            (err, data) => err ? reject(err) : resolve(data))
    );

/** Read a file to a buffer */
export const readFile = (filePath: fs.PathLike) =>
    new Promise((resolve: (data: Buffer) => void, reject: (err: NodeJS.ErrnoException) => void) => 
        fs.readFile(filePath, (err, data) => err ? reject(err) : resolve(data))
    );