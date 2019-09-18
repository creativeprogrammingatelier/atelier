import decode from "jwt-decode";
import AuthHelper from "./AuthHelper";
import axios from "axios";
/**
 * Helpers for request for files
 */
export default class UserHelper {

    static getStudents = (onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`/students`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: any) => {
                onSuccess(json)
            });
        }).catch(function (error) {
            console.log(error);
            onFailure(error);
        })
    }
}