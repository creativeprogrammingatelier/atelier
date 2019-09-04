const Comment = require('../models/comment');
const fs = require('fs');
/**
 * Files middleware provides helper methods for interacting with comments in the DB
 * @Author Andrew Heath
 */
module.exports = {

    makeComment: function (fileId, userId, body, successCallback, errorCallback) {
        const newComment = new Comment({
            about: fileId,
            author: userId,
            body: body
        })
        newComment.save((error => {
            if (!error) {
                successCallback();
            } else {
                errorCallback(error);
            }
        }))

    },

    getComments: function (fileId, successCallback, failureCallback) {
        Comment.find({
                about: fileId
            }, "-_id")
            .populate('author', "-_id").
        exec((error, result) => {
            if (!error) {
                successCallback(result);
            } else {
                failureCallback(error);
            }
        })
    },
    canViewComment: (request, result, next) => {
        console.log("canViewComment NO YET IMPLEMENTED ")
    }

}