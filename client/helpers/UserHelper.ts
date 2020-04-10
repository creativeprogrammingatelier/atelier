import {User} from '../../models/api/User';
import {Fetch} from './FetchHelper';

/**
 * Helpers for request for files
 * @deprecated This class uses old API endpoints and should not be used
 */
export default class UserHelper {

    static getStudents = (
        onSuccess: (students: User[]) => void,
        onFailure: Function) => {
        Fetch.fetch(`users/students`, {
            method: 'GET'
        }).then((response) => {
            response.json().then((json: User[]) => {
                onSuccess(json);
            });
        }).catch((error) => {
            console.error(error);
            onFailure(error);
        });
    };

    static getUsers = (
        onSuccess: (students: User[]) => void,
        onFailure: Function) => {
        Fetch.fetch(`users`, {
            method: 'GET'
        }).then((response) => {
            response.json().then((json: User[]) => {
                onSuccess(json);
            });
        }).catch((error) => {
            console.error(error);
            onFailure(error);
        });
    };

    static deleteUser = (
        userId: any,
        onSuccess: (students: User[]) => void,
        onFailure: Function) => {
        Fetch.fetch(`users/${userId}`, {
            method: 'delete'
        }).then((response) => {
            response.json().then((res: any) => {
                onSuccess(res);
            });
        }).catch((error) => {
            console.error(error);
            onFailure(error);
        });
    };

    static updateUser = (user: any,
                         onSuccess: () => void,
                         onFailure: Function) => {
        Fetch.fetch(`users`, {
            body: JSON.stringify({user})
        }).then((response) => {
            onSuccess();

        }).catch((error) => {
            onFailure();
        });

    };

}