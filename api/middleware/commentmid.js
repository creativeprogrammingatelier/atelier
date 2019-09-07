const Comment = require('../models/comment');
const fs = require('fs');
/**
 * Files middleware provides helper methods for interacting with comments in the DB
 * @Author Andrew Heath
 */
module.exports = {

    makeComment: function (fileId, userId, line, body, successCallback, errorCallback) {
        const newComment = new Comment({
            about: fileId,
            author: userId,
            body: body,
            line: line
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
            })
            .populate('author', "-_id -password").
        exec((error, result) => {
            if (!error) {
                successCallback(result);
            } else {
                failureCallback(error);
            }
        })
    },
    deleteComment: function (commentId, successCallback, failureCallback){
        Comment.deleteOne({
            _id: commentId
        },(error, result) => {
            if (!error) {
                successCallback(result);
            } else {
                failureCallback(error);
            }
        }
        )
    }
}