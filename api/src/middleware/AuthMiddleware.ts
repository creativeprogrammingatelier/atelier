/**
 * Middleware
 *  Provides management of token, and authentication checks
 * Author: Andrew Heath
 * Created: 13/08/19
 */

import { getCurrentUserID, verifyToken } from '../helpers/AuthenticationHelper';
import { AUTHSECRETKEY } from '../lib/constants';
import {Request, Response} from 'express';
import {User} from '../../../models/User';
import { UserDB } from '../database/UserDB';

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
	static async withAuth(request: Request, result: Response, onSuccess: Function): Promise<void> {
		const token = request.headers?.authorization;
		if (!token) {
			result.status(401).send('Unauthorized: No token provided');
		} else {
            const props = await verifyToken(token);
            onSuccess(props);
		}
	}

	/**
	* check permissions for pages on a global level
	*/
	static async checkRole(request: Request, role: String, onSuccess: Function, onFailure : (error : Error) => void) {
        const userID = await getCurrentUserID(request);
        const user = await UserDB.getUserByID(userID);
        if (user.role!.toLowerCase() === role.toLowerCase()) {
            onSuccess();
        } else {
            onFailure(new Error('Unauthorized: Incorrect role'));
        }
	}

	/**
	* check permissions for pages on a global level
	*/
	static async checkRoles(request: Request, roles: String[], onSuccess: Function, onFailure : Function) {
        const userID = await getCurrentUserID(request);
        const user = await UserDB.getUserByID(userID);
		for (const role of roles) {
            if (user.role!.toLowerCase() === role.toLowerCase()) {
                onSuccess();
                return;
            }
        }
        onFailure();
	}

	static async getRole(request: Request, onSuccess: Function, onFailure : (error : Error) => void) {
        const userID = await getCurrentUserID(request);
        const user = await UserDB.getUserByID(userID);
        onSuccess(user.role!.toLowerCase());
	}
}