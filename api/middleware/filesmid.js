const Files = require('../models/file');
const fs = require('fs');
/**
 * Files middleware provides helper methods for interacting with Files in the DB
 * @Author Andrew Heath
 */
module.exports = {
    /**
     * Return files belonging to user
     * @param {*} userid 
     * @param {*} numberOfFiles # of files to be returned 
     * @TODO implement numberOfFiles
     */
    getFiles: function (userid, numberOfFiles) {
        return Files.find({
            owner: userid
        }, "_id name", (error, result) => {
            return result;
        })
    },
    /**
     * Returns the files object with a given Id
     * @param {*} fileId 
     * @param {*} next callback
     */
    getFile: function (fileId, next) {
        return Files.find({
            _id: fileId
        }, "-_id", (error, result) => {
            return next(result);
        })
    },
    /**
     * Returns file path of files with Id
     * @param {*} fileid 
     */
    getFilePath: function (fileid) {
        return Files.find({
            _id: fileid
        }, "-_id path name", {
            limit: 1
        });
    },
    /**
     * Reads file from disk 
     * @param {*} filePath location of file
     * @param {*} next callback
     */
    readFile: function (filePath, next) {
        return fs.readFile(filePath, {
            encoding: 'utf-8'
        }, (err, data) => {
            if (err) {
                throw err;
            }
            return next(data);
        });
    },
    /**
     * Deletes file from the database 
     * @param {*} fileid 
     * @TODO delete file from disk as well
     */
    deleteFile: function (fileid) {
        return Files.deleteOne({
            _id: fileid
        }, (error, data) => {
            if (error) {
                throw error;
            }
            return data;
        })
    }


}