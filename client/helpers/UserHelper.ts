import decode from "jwt-decode";
import AuthHelper from "./AuthHelper";
import axios from "axios";
/**
 * Helpers for request for files
 */
export default class UserHelper {

    static getStudents = (success: Function, failure: Function) => {
        AuthHelper.fetch(`/students`, {
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