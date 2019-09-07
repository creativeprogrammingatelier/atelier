import decode from "jwt-decode";
import AuthHelper from "./AuthHelper";
import axios from "axios";
/**
 * Helpers for request for files
 */
export default class CommentHelper {

    static getComments = (fileId: number, onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/getComments?fileId=${fileId}`, {
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
        AuthHelper.fetch(`/makeComment`, {
            method: "PUT",
            body
        }).then(() => {
            onSuccess()
        }).catch(function (error) {
            onFailure(error)
        })
    }

    static deleteComment = (commentId: String, onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/comment/${commentId}`, {
            method: "delete"
        }).then(() => {
            onSuccess()
        }).catch(function (error) {
            onFailure(error)
        })

    };
}