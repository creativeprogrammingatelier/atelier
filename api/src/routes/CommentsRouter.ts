/**
 * Comemnts Routes File 
 * Author: Andrew Heath
 * Date Created: 19/08/19
 */

/**
 * Dependencies 
 */
import express, {Request, Response} from "express";
import AuthMiddleware from "../middleware/AuthMiddleware";
import CommentsMiddleware from "../middleware/CommentMiddleware";
import UsersMiddlware from "../middleware/UsersMiddleware";
import { IUser } from "../../../models/user";
import PermissionsMiddleware from "../middleware/PermissionsMiddleware";
import FilesMiddleware from "../middleware/FilesMiddleware";
import { IFile } from "../../../models/file";
import RoutesHelper from "../helpers/RoutesHelper";
import { Socket } from "socket.io";
import SocketMiddleware from "../middleware/SocketMiddleware";
import comment, { IComment } from "../../../models/comment";
var router = express.Router();


router.put('/', AuthMiddleware.withAuth, PermissionsMiddleware.checkFileWithId, (request : Request, response: Response) => {
    const fileId: String =  RoutesHelper.getValueFromBody('fileId', request, response);
    const lineId: String = RoutesHelper.getValueFromBody('line', request, response);
    const comment: String = RoutesHelper.getValueFromBody('comment', request, response);
    UsersMiddlware.getUser(request, (user: IUser, request: Request) => {
        CommentsMiddleware.makeCommentReturnComment(fileId, user._id, lineId, comment, (comment: any) =>{response.status(204).send(), SocketMiddleware.sendCommentUpdate(request, fileId.toString(), comment) }, (error: Error) => {console.error(error); response.status(500).send()})
    },(error: Error) => {console.error(error); response.status(500).send()}
    )
});

router.get('/file/:fileId', AuthMiddleware.withAuth, PermissionsMiddleware.checkFileWithId, (request, response) => {
    const fileId: String =  RoutesHelper.getValueFromParams('fileId', request, response);
    CommentsMiddleware.getFileComments(fileId, (data:any ) => response.status(200).send(data), (error: Error) => {console.error(error); response.status(500).send()});
});

router.delete('/:commentId', AuthMiddleware.withAuth, PermissionsMiddleware.checkComment, (request, response) => {
    const commentId: String = RoutesHelper.getValueFromParams('commentId', request, response);
    CommentsMiddleware.deleteComment(commentId, (comment: IComment) => { response.status(200).send(), SocketMiddleware.sendCommentDelete(request, comment.about.toString(), comment)}, (error: Error) => {console.error(error); response.status(500).send()})
});



module.exports = router;