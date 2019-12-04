import Comment, { IComment } from "../../../models/comment";

/**
 * Files middleware provides helper methods for interacting with comments in the DB
 * @Author Andrew Heath
 */

export default class CommentMiddleware{

    static makeComment (fileId: String, userId : String, line: String, body: string, onSuccess: Function, onFailure: Function) {
        const newComment: IComment = new Comment({
            about: fileId,
            author: userId,
            body: body,
            line: line
        })
        newComment.save((error: Error) => {
            if (!error) {
                onSuccess(newComment);
            } else {
                onFailure(error);
            }
        });
    }

    static makeCommentReturnComment(fileId: String, userId : String, line: String, body: string, onSuccess: Function, onFailure: Function) {
        CommentMiddleware.makeComment(fileId, userId, line, body, 
            (newComment: IComment)=> this.getComment(newComment.id, onSuccess, onFailure), 
            () => onFailure()
        );
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
        ).populate('author', "-_id -password").
        exec((error, response) => {
            if (!error) {
                onSuccess(response);
            } else {
                onFailure(error);
            }
        })
    }

    static deleteComment (commentId: String, onSuccess: Function, onFailure: Function){
        CommentMiddleware.getComment(commentId,
            (comment: IComment)=>{
                Comment.deleteOne({
                    _id: commentId
                },(error: Error) => {
                    if (!error) {
                        onSuccess(comment);
                    } else {
                        onFailure(error);
                    }
                }
            )},
            (error: Error)=>{
                onFailure(error);
            }
        )
    }
}