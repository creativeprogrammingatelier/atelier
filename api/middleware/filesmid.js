const Files = require('../models/file');
const fs = require('fs');
module.exports = {
    getFiles: function (userid, numberOfFiles) {
        return Files.find({
            owner: userid
        }, "_id name", (error, result) => {
            return result;
        })
    },
    getFile: function (fileId, next) {
        return Files.find({
            _id: fileId
        }, "-_id", (error, result) => {
            return next(result);
        })
    },

    getFilePath: function (fileid) {
        return Files.find({
            _id: fileid
        }, "-_id path name", {
            limit: 1
        });
    },
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
    deleteFile: function (fileid) {
        return Files.deleteOne({
            _id: fileid
        }, (error, data) => {
            if (error) {
                throw error;
            }
            console.log(data)
            return data;
        })
    }


}