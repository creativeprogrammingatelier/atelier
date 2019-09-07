/**
 * Comemnts Routes File 
 * Author: Andrew Heath
 * Date Created: 19/08/19
 */

/**
 * Dependencies 
 */
var express = require('express');
var router = express.Router();
const path = require('path');
var Auth = require('../middleware/auth');
var Commentmid = require('../middleware/commentmid');
var Usersmid = require('../middleware/usersmid');
// TODO check user has permission make comment
// TODO get comment author id from the token not from the parameter
router.put('/makeComment', Auth.withAuth, (request, result) => {
    Usersmid.getUser(request, (user, request) => {
        const {
            fileId,
            comment,
            line
        } = request.body;
        Commentmid.makeComment(fileId, user._id, line, comment, () => result.status(204).send(), (error) => result.status(500).send(error))
    },(error) => result.status(500).send(error)
    )
});

// TODO check user has permission to get comments
router.get('/getComments', Auth.withAuth, (request, result) => {
    const {
        fileId,
    } = request.query;

    Commentmid.getComments(fileId, (data) => result.status(200).send(data), (error) => result.status(500).send(error))
});
// TODO check user has permission to delete comment
router.delete('/comment/:commentId', Auth.withAuth, Auth.isTa, (request, result) => {
    Commentmid.deleteComment(request.params.commentId, (data) => result.status(200).send(data), (error) => result.status(500).send(error))
});
module.exports = router;