/**
 * Comemnts Routes File 
 * Author: Andrew Heath
 * Date Created: 19/08/19
 */

/**
 * Dependencies 
 */
import express, {Request} from "express";
import AuthMiddleware from "../middleware/AuthMiddleware";
import CommentsMiddleware from "../middleware/CommentMiddleware";
import UsersMiddlware from "../middleware/UsersMiddleware";
import { IUser } from "../models/user";
var router = express.Router();
// TODO check user has permission make comment
// TODO get comment author id from the token not from the parameter
router.put('/', AuthMiddleware.withAuth, (request, result) => {
    UsersMiddlware.getUser(request, (user: IUser, request: Request) => {
        const {
            fileId,
            comment,
            line
        } = request.body;
        CommentsMiddleware.makeComment(fileId, user._id, line, comment, () => result.status(204).send(), (error: Error) => result.status(500).send(error))
    },(error: Error) => result.status(500).send(error)
    )
});

// TODO check user has permission to get comments
router.get('/file/:fileId', AuthMiddleware.withAuth, (request, result) => {
    CommentsMiddleware.getComments(request.params.fileId, (data:any ) => result.status(200).send(data), (error: Error) => result.status(500).send(error))
});
// TODO check user has permission to delete comment
router.delete('/:commentId', AuthMiddleware.withAuth, AuthMiddleware.isTa, (request, result) => {
    CommentsMiddleware.deleteComment(request.params.commentId, (data: any) => result.status(200).send(data), (error: Error) => result.status(500).send(error))
});
module.exports = router;