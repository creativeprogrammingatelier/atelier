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
import PermissionsMiddleware from "../middleware/PermissionsMiddleware";
var router = express.Router();
router.put('/', AuthMiddleware.withAuth, (request, result) => {
    UsersMiddlware.getUser(request, (user: IUser, request: Request) => {
        const {
            fileId,
            comment,
            line
        } = request.body;
        PermissionsMiddleware.checkFileWithId(fileId, request,
            ()=> CommentsMiddleware.makeComment(fileId, user._id, line, comment, () => result.status(204).send(), (error: Error) => result.status(500).send(error)),
            ()=> result.status(401).send(),
            ()=> result.status(500).send()
            )
    },(error: Error) => result.status(500).send(error)
    )
});

router.get('/file/:fileId', AuthMiddleware.withAuth, (request, result) => {
    const fileId = request.params.fileId;
    PermissionsMiddleware.checkFileWithId(fileId, request,
        ()=>  CommentsMiddleware.getFileComments(fileId, (data:any ) => result.status(200).send(data), (error: Error) => result.status(500).send(error))
        ,
        ()=> result.status(401).send(),
        ()=> result.status(500).send()
        )
});

router.delete('/:commentId', AuthMiddleware.withAuth, (request, result) => {
    const commentId = request.params.commentId;
    PermissionsMiddleware.checkComment(commentId, request,
        ()=>    CommentsMiddleware.deleteComment(commentId, (data: any) => result.status(200).send(data), (error: Error) => result.status(500).send(error)),
        ()=> result.status(401).send(),
        ()=> result.status(500).send()
        )
});
module.exports = router;