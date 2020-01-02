import decode from "jwt-decode";
import AuthHelper from "./AuthHelper";
import axios from "axios";
import { IUser } from "../../models/user";
/**
 * Helpers for request for files
 */
export default class UserHelper {

    static getStudents = (onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`users/students`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: IUser[]) => {
                onSuccess(json)
            });
        }).catch(function (error) {
            console.error(error);
            onFailure(error);
        })
    }

    static getUsers = (onSuccess: Function, onFailure: Function) => {
        AuthHelper.fetch(`users`, {
            method: "GET",
        }).then((response) => {
            response.json().then((json: IUser[]) => {
                onSuccess(json)
            });
        }).catch(function (error) {
            console.error(error);
            onFailure(error);
        })
    }
}