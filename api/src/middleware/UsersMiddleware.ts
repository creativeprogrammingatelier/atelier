import fs from 'fs';
import jwt from 'jsonwebtoken';
import {Constants} from '../lib/constants';
import {Request, Response} from 'express';
import {User} from '../../../models/user2';
import FilesMiddleware from './FilesMiddleware';
import AuthMiddleWare from './AuthMiddleware';
import UsersHelper from '../database/UsersHelper'
/**
 * Files middleware provides helper methods for interacting with comments in the DB
 * @Author Andrew Heath
 */
export default class UsersMiddleware {

	//@DEPRECATED
	static getAllStudents(onSuccess: Function, onFailure: Function) {
		UsersHelper.getAllStudents(onSuccess,onFailure)
	}
	//@DEPRECATED
	static getAllUsers(onSuccess: Function, onFailure: Function) {
		UsersHelper.getAllUsers(onSuccess,onFailure)
	}
	/**
	 * Get the user object corresponding to the request
	 * @param {*} request
	 * @param {*} next callback
	 */
	 static getUser(request: Request, onSuccess: Function, onFailure: Function) {
		const token = (request.headers && request.headers.authorization) ? request.headers.authorization : undefined;
		if (token !== undefined) {
			jwt.verify(token, Constants.AUTHSECRETKEY, (error: Error, decoded: any) => {
				if (error) {
					onFailure(error);
				} else {
					const userid = decoded.userid;
					UsersHelper.getUserByID(userid, (res : User[]) =>{
						onSuccess(res, request)
					}, onFailure);
				}
			});
		} else {
			onFailure();
		}
	}
	static createUser(request: Request, onSuccess: Function, onFailure: Function) {
		// @TODO: extend registration page for name?
		const {
			email,
			password,
			role = "user",
			name = email.split('@', 1)[0].replace('.', ' ')
		} = request.body;
		const record = {email, password,role,name}
		UsersHelper.createUser(record, (res : {userid:string}) => {
			onSuccess(this.issueToken(res.userid))
		}, onFailure)
	}

	//@DEPRECATED
	static updateUser(user: User, onSuccess: Function, onFailure: Function) {
		UsersHelper.updateUser(user, onSuccess, onFailure)
	}

	//@DEPRECATED
	static deleteUser(userID: string, onSuccess: Function, onFailure: Function) {
		UsersHelper.deleteUser(userID, onSuccess, onFailure)
	}

	static loginUser(request: Request, onSuccess: Function, onUnauthorised: Function, onFailure: Function) {
		const {
			email,
			password
		} = request.body;
		UsersHelper.loginUser(
			{email, password}
			, (userid : string) => onSuccess(this.issueToken(userid))
			, onUnauthorised
			, onFailure)
	}

	private static issueToken(email: string): string {
		const payload = {email};
		const token: string = jwt.sign(payload, Constants.AUTHSECRETKEY, {
			expiresIn: '1h'
		});
		return token;
	}
}