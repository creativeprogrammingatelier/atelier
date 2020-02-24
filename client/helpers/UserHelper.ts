import decode from 'jwt-decode';
import AuthHelper from './AuthHelper';
import axios from 'axios';
import {User} from '../../models/database/User';

/**
 * Helpers for request for files
 */
export default class UserHelper {

	static getStudents = (onSuccess: Function, onFailure: Function) => {
		AuthHelper.fetch(`users/students`, {
			method: 'GET'
		}).then((response) => {
			response.json().then((json: User[]) => {
				onSuccess(json);
			});
		}).catch(function(error) {
			console.error(error);
			onFailure(error);
		});
	};

	static getUsers = (onSuccess: Function, onFailure: Function) => {
		AuthHelper.fetch(`users`, {
			method: 'GET'
		}).then((response) => {
			response.json().then((json: User[]) => {
				onSuccess(json);
			});
		}).catch(function(error) {
			console.error(error);
			onFailure(error);
		});
	};

	static deleteUser = (userId: any, onSuccess: Function, onFailure: Function) => {
		AuthHelper.fetch(`users/${userId}`, {
			method: 'delete'
		}).then((response) => {
			response.json().then((res: any) => {
				onSuccess(res);
			});
		}).catch(function(error) {
			console.error(error);
			onFailure(error);
		});
	};

	static updateUser = (user: any, onSuccess: Function, onFailure: Function) => {
		const config = {
			headers: {
				'Authorization': AuthHelper.getToken()
			}
		};
		axios.put(`users`, {
				'user': user
			},
			config
		).then((response) => {
			onSuccess();

		}).catch(function(error) {
			onFailure();
		});

	};

}