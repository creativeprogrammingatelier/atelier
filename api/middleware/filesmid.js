const Files = require('../models/file');
module.exports = {
    getFiles: function (userid, numberOfFiles) {
        return Files.find({
            owner: userid
        }, "_id name", (error, result) => {
            return result;
        })

    },

    getFilePath: function (fileid) {
        return Files.find({
            _id: fileid
        }, "-_id path name", {
            limit: 1
        });
    }
}