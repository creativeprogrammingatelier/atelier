import { IUser } from "../models/user";

const FileModel = require('../models/file');
const fs = require('fs');
import UserModel from "../models/user";
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
    static getFiles(userid, onSuccess, onFailure){
        FileModel.find({
                owner: userid
            }, "_id name", (error, result) => {
                if(!error){
                    onSuccess(result);
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
    static getFile (fileId, next) {
        return FileModel.find({
            _id: fileId
        }, "_id name body owner path", (error, result) => {
            return next(result);
        })
    }
    /**
     * Returns file path of files with Id
     * @param {*} fileid 
     */
    static getFilePath (fileid) {
        return FileModel.find({
            _id: fileid
        }, "-_id path name", {
            limit: 1
        });
    }
    /*
     * Reads file from disk 
     * @param {*} filePath location of file
     * @param {*} next callback
     */
    static readFile (filePath, onSuccess: Function, onFailure: Function) {
        fs.readFile(filePath, {
            encoding: 'utf-8'
        }, (err, data) => {
            if (err) {
                onFailure(err);
            }
            onSuccess(data);
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
        }, (error, data) => {
            if (error) {
                onFailure(error);
            }
            onSuccess(data);
        })
    }


    static createFile (fileName :String, path :String, user: IUser, onSuccess: Function, onFailure: Function ){
        const newFile = new FileModel({
            file: {fileName: fileName},
            path: path,
            owner: user
        });
        newFile.save((error) => {
            if (error) {
                console.log(`File Uploading error has occured: ${error}`)
                onFailure('Error Uploading File');
            } else {
                onSuccess("File Uploaded");
            }
        });
    }

}