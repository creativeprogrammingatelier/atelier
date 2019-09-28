/**
 * Comemnts Routes File 
 * Author: Andrew Heath
 * Date Created: 19/08/19
 */

/**
 * Dependencies 
 */
import express from "express";
import AuthMiddleware from "../middleware/AuthMiddleware";
import CommentsMiddleware from "../middleware/CommentMiddleware";
import UsersMiddlware from "../middleware/UsersMiddleware";
var router = express.Router();
// TODO check user has permission make comment
// TODO get comment author id from the token not from the parameter
router.put('/makeComment', AuthMiddleware.withAuth, (request, result) => {
    UsersMiddlware.getUser(request, (user, request) => {
        const {
            fileId,
            comment,
            line
        } = request.body;
        CommentsMiddleware.makeComment(fileId, user._id, line, comment, () => result.status(204).send(), (error) => result.status(500).send(error))
    },(error) => result.status(500).send(error)
    )
});

// TODO check user has permission to get comments
router.get('/getComments', AuthMiddleware.withAuth, (request, result) => {
    const {
        fileId,
    } = request.query;

    CommentsMiddleware.getComments(fileId, (data) => result.status(200).send(data), (error) => result.status(500).send(error))
});
// TODO check user has permission to delete comment
router.delete('/comment/:commentId', AuthMiddleware.withAuth, AuthMiddleware.isTa, (request, result) => {
    CommentsMiddleware.deleteComment(request.params.commentId, (data) => result.status(200).send(data), (error) => result.status(500).send(error))
});
module.exports = router;