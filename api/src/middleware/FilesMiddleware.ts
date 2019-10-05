import FileModel, { IFile } from "../models/file";
import fs, { PathLike } from "fs";
import UserModel, { IUser } from "../models/user";
/**
 * Files middleware provides helper methods for interacting with Files in the DB
 * @Author Andrew Heath
 */
export default class FilesMiddleware{
    /**
     * Return files belonging to user
     * @param {*} userid 
     * @param {*} numberOfFiles # of files to be returned 
     * @TODO implement numberOfFiles
     */
    static getFiles(userid: String, onSuccess: Function, onFailure: Function){
        FileModel.find({
                owner: userid
            }, "_id name", (error: Error, response: Response) => {
                if(!error){
                    onSuccess(response);
                }
                else{
                    onFailure(error)
                }
            })
    }
    /**
     * Returns the files object with a given Id
     * @param {*} fileId 
     * @param {*} next callback
     */
    static getFile (fileId: String, onSuccess: Function, onFailure: Function) {
        return FileModel.find({
            _id: fileId
        }, "_id name body owner path", (error: Error, response: Response) => {
            return onSuccess(response);
        })
    }
    /**
     * Returns file path of files with Id
     * @param {*} fileid 
     */
    static getFilePath (fileid: String, onSuccess:Function, onFailure: Function) {
        FileModel.find({
            _id: fileid
        }, "-_id path name", {
            limit: 1
        },(error: Error, data: any) => {
            if (error) {
                onFailure(error);
            }
            onSuccess(data);
        });
    }
    /*
     * Reads file from disk 
     * @param {*} filePath location of file
     * @param {*} next callback
     */
    static readFileFromDisk (file: IFile, filePath: PathLike, onSuccess: Function, onFailure: Function) {
        fs.readFile(filePath, {
            encoding: 'utf-8'
        }, (error: Error, data: any) => {
            if (error) {
                onFailure(error);
            }
            onSuccess({
                name: file.name,
                body: data,
                id: file._id
            });
        });
    }
    /**
     * Deletes file from the database 
     * @param {*} fileid 
     * @TODO delete file from disk as well
     */
    static deleteFile (fileid: String, onSuccess: Function, onFailure: Function) {
        FileModel.deleteOne({
            _id: fileid
        }, (error: Error) => {
            if (error) {
                onFailure(error);
            }
            onSuccess();
        })
    }


    static createFile (fileName :String, path :String, user: IUser, onSuccess: Function, onFailure: Function ){
        const newFile = new FileModel({
            path: path,
            owner: user,
            name: fileName
        });
        newFile.save((error: Error) => {
            if (error) {
                console.error(error)
                onFailure('Error Uploading File');
            } else {
                onSuccess("File Uploaded");
            }
        });
    }

}