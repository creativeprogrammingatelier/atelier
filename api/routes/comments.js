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
// TODO check user has permission make comment
router.put('/makeComment', Auth.withAuth, Auth.isTa, (request, result) => {
    const {
        fileId,
        userId,
        comment,
    } = request.body;
    Commentmid.makeComment(fileId, userId, comment, () => result.status(204).send(), (error) => result.status(500).send(error));


});

// TODO check user has permission to get comments
router.get('/getComments', Auth.withAuth, (request, result) => {
    const {
        fileId,
    } = request.query;

    Commentmid.getComments(fileId, (data) => result.status(200).send(data), (error) => result.status(500).send(error))
});
module.exports = router;