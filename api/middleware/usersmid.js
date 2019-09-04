const Comment = require('../models/comment');
const fs = require('fs');
/**
 * Files middleware provides helper methods for interacting with comments in the DB
 * @Author Andrew Heath
 */
module.exports = {
    getAllStudents: (successCallback, failureCallback) => {
        User.find({
            role: "student"
        }, (error, result) => {
            if (!error) {
                successCallback(result);
            } else {
                failureCallback(error);
            }
        })

    }
}