import AuthHelper from "./AuthHelper";
/**
 * Helpers for request for files
 */
export default class CommentHelper {

    static getFileComments = (fileId: number, onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/comments/file/${fileId}`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                onSuccess(json)
            });
        }).catch(function (error) {
            onFailure(error)
        })
    }

    static putComment = (body: any, onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/comments`, {
            method: "PUT",
            body
        }).then(() => {
            onSuccess()
        }).catch(function (error) {
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