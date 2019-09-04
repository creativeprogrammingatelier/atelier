import decode from "jwt-decode";
import AuthHelper from "./AuthHelper";
import axios from "axios";
/**
 * Helpers for request for files
 */
export default class CommentHelper {

    static getComments = (fileId: number, success: Function, failure: Function) => {
        AuthHelper.fetch(`/getComments?fileId=${fileId}`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                success(json)
            });
        }).catch(function (error) {
            failure(error)
        })
    }
}