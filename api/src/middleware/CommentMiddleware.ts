/**
 * Files middleware provides helper methods for interacting with comments in the DB
 * @Author Andrew Heath
 */

import Comment, {IComment} from "../models/comment";
export default class CommentMiddleware{

    static makeComment (fileId: String, userId : String, line: String, body: any, onSuccess: Function, onFailure: Function) {
        const newComment: IComment = new Comment({
            about: fileId,
            author: userId,
            body: body,
            line: line
        })
        newComment.save((error: Error) => {
            if (!error) {
                onSuccess();
            } else {
                onFailure(error);
            }
        });
    }

    static getFileComments(fileId: String, onSuccess: Function, onFailure : Function){
        Comment.find({
                about: fileId
            })
            .populate('author', "-_id -password").
        exec((error, response) => {
            if (!error) {
                onSuccess(response);
            } else {
                onFailure(error);
            }
        })
    }

    static getComment(commentId: String, onSuccess: Function, onFailure: Function){
        Comment.findById(commentId,
            (error: Error, comment: IComment) =>{
                if(error){
                    onFailure(error);
                }else{
                    onSuccess(comment);
                }
            }
        );
    }

    static deleteComment (commentId: String, onSuccess: Function, onFailure: Function){
        Comment.deleteOne({
            _id: commentId
        },(error: Error) => {
            if (!error) {
                onSuccess();
            } else {
                onFailure(error);
            }
        }
        )
    }
}