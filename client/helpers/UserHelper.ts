import decode from 'jwt-decode';
import AuthHelper from './AuthHelper';
import axios from 'axios';
import {User} from '../../models/database/User';
import { Fetch } from './FetchHelper';

/**
 * Helpers for request for files
 * @deprecated This class uses old API endpoints and should not be used
 */
export default class UserHelper {

	static getStudents = (onSuccess: Function, onFailure: Function) => {
		Fetch.fetch(`users/students`, {
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
		Fetch.fetch(`users`, {
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
		Fetch.fetch(`users/${userId}`, {
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