import AuthHelper from "./AuthHelper";
import { IComment } from "../../models/comment";
/**
 * Helpers for request for files
 */
export default class CommentHelper {

    static getFileComments = (fileId: String, onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/comments/file/${fileId}`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: IComment[]) => {
                onSuccess(json)
            });
        }).catch((error) =>  {
            onFailure(error)
        })

    
    }

    static putComment = (comment: IComment, onSuccess: Function, onFailure: Function) => {
        let commentAsString: string = comment.toString();
        AuthHelper.fetch(`/comments`, {
            method: "PUT",
            body: commentAsString
        }).then(() => {
            onSuccess()
        }).catch(function (error: Error) {
            onFailure(error)
        })
    }

    static deleteComment = (commentId: String, onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/comments/${commentId}`, {
            method: "delete"
        }).then(() => {
            onSuccess()
        }).catch(function (error) {
            onFailure(error)
        })

    };
}