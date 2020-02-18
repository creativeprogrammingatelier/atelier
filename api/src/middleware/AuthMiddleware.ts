/**
 * Middleware
 *  Provides management of token, and authentication checks
 * Author: Andrew Heath
 * Created: 13/08/19
 */

import jwt from 'jsonwebtoken';
import UsersMiddleware from './UsersMiddleware';
import {Constants} from '../lib/constants';
import {Request, Response} from 'express';
import {User, IUser} from '../../../models/user';

/**
* @TODO insert withauth at the start of routers to ensure authentication and unify it.
*/
export default class AuthMiddleWare {
	/**
	 * Checks to see whether requset is authenticated correctly
	 * @param {*} request
	 * @param {*} result
	 * @param {*} next Callback

	 * onSuccess will receive the information encoded in the token found.
	 */
	static withAuth(request: Request, result: Response, onSuccess: Function): void {
		const token = request.headers && request.headers.authorization;
		if (!token) {
			result.status(401).send('Unauthorized: No token provided');
		} else {
			jwt.verify(token, Constants.AUTHSECRETKEY, function(error: Error, decoded: Object) {
				if (error) {
					console.error(error);
					result.status(401).send('Unauthorized: Invalid token');
				} else {
					onSuccess(decoded);
				}
			});
		}
	}

	/**
	* check permissions for pages on a global level
	*/
	static checkRole(request: Request, role: String, onSuccess: Function, onFailure : (error : Error) => void) {
		UsersMiddleware.getUser(request, (user: IUser) => {
			if (user.role.toLowerCase() == role.toLowerCase()) {
				onSuccess();
			} else {
				onFailure(new Error('Unauthorized: Incorrect role'));
			}
		}, onFailure);
	}

	/**
	* check permissions for pages on a global level
	*/
	static checkRoles(request: Request, roles: String[], onSuccess: Function, onFailure : (error : Error) => void) {
		for (const role of roles) {
			UsersMiddleware.getUser(request, (user: IUser) => {
				if (user.role.toLowerCase() == role.toLowerCase()) {
					onSuccess();
				}
			}, onFailure);
		}
	}

	static getRole(request: Request, onSuccess: Function, onFailure : (error : Error) => void) {
		UsersMiddleware.getUser(request, (user: IUser) => {
			onSuccess(user.role.toLowerCase());
		}, onFailure);
	}
}