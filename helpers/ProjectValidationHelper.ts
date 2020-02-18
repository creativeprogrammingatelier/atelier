import path from 'path';

import { CODEFILE_EXTENSIONS, MAX_FILE_SIZE } from '../helpers/Constants';

// Interfaces
/////////////
/** Possible errors for invalid projects */
export interface ProjectValidation<T extends Fileish<T>> {
    /** The project doesn't contain any files with a code file extension */
    containsNoCodeFiles: boolean,
    /** The project has no file with the name of the project */
    invalidProjectName: boolean,
    /** List of filenames that are too large, or false if there are none */
    acceptableFiles: T[]
}

/** Default values for projects with no errors */
export function defaultValidation<T extends Fileish<T>>(files: T[]): ProjectValidation<T> {
    return {
        containsNoCodeFiles: false,
        invalidProjectName: false,
        acceptableFiles: files
    };
}

/** Internal abstraction for files */
interface ProjectFile<T> {
    original: T,
    pathInProject: string,
    size: number
}

/** Is some sort of file */
type Fileish<T> = ProjectFile<T> | Express.Multer.File | File;

// Validation checks
////////////////////
function containsNoCodeFiles<T>(files: Array<ProjectFile<T>>) {
    return !files.some(f => CODEFILE_EXTENSIONS.includes(path.extname(f.pathInProject)));
}

function invalidProjectName<T>(projectName: string, files: Array<ProjectFile<T>>) {
    return !files.some(f => f.pathInProject === `${projectName}/${projectName}.pde`);
}

function acceptableFiles<T>(files: Array<ProjectFile<T>>) {
    return files.filter(f => f.size < MAX_FILE_SIZE);
}

// Validation execution
///////////////////////
/** Execute all checks and return the result */
function validateProjectInternal<T extends Fileish<T>>(projectName: string, files: Array<ProjectFile<T>>): ProjectValidation<T> {
    const acceptable = acceptableFiles(files);
    return {
        containsNoCodeFiles: containsNoCodeFiles(acceptable),
        invalidProjectName: invalidProjectName(projectName, acceptable),
        acceptableFiles: acceptable.map(f => f.original)
    }
}

/** Execute all checks with files as they are modeled on the server */
export function validateProjectServer(projectName: string, files: Express.Multer.File[]) {
    const filesInternal = files.map(f => ({ 
        original: f,
        pathInProject: f.originalname,
        size: f.size
    }));
    return validateProjectInternal(projectName, filesInternal);
}

/** Execute all checks with files as they are modeled on the client */
export function validateProjectClient(projectName: string, files: File[]) {
    const filesInternal = files.map(f => ({ 
        original: f,
        pathInProject: f.webkitRelativePath || `${projectName}/${f.name}`,
        size: f.size
    }));
    return validateProjectInternal(projectName, filesInternal);
}