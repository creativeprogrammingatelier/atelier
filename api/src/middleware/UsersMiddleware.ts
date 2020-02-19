import fs from 'fs';
import jwt from 'jsonwebtoken';
import { AUTHSECRETKEY } from '../lib/constants';
import {Request, Response} from 'express';
import {User} from '../../../models/User';
import FilesMiddleware from './FilesMiddleware';
import AuthMiddleWare from './AuthMiddleware';
import UsersHelper from '../database/UsersHelper'
/**
 * Files middleware provides helper methods for interacting with comments in the DB
 * @Author Andrew Heath
 */
export default class UsersMiddleware {

	//@DEPRECATED
	static getAllStudents(onSuccess: any, onFailure : (error : Error) => void) {
		UsersHelper.getAllStudents().then(onSuccess).catch(onFailure)
	}
	//@DEPRECATED
	static getAllUsers(onSuccess: any, onFailure : (error : Error) => void) {
		UsersHelper.getAllUsers().then(onSuccess).catch(onFailure)
	}
	/**
	 * Get the user object corresponding to the request
	 * @param {*} request
	 * @param {*} next callback
	 */
	 static getUser(request: Request, onSuccess: any, onFailure : (error : Error) => void) {
		const token = (request.headers && request.headers.authorization) ? request.headers.authorization : undefined;
		if (token !== undefined) {
			jwt.verify(token, AUTHSECRETKEY, (error: Error, decoded: any) => {
				if (error) {
					onFailure(error);
				} else {
					const userID = decoded.userID;
					UsersHelper.getUserByID(userID).then((res : User) =>{
						onSuccess(res, request)
					}).catch(onFailure);
				}
			});
		} else {
			onFailure(new Error("no Token provided"));
		}
	}
	static createUser(request: Request, onSuccess: any, onFailure : (error : Error) => void) {
		// @TODO: extend registration page for name?
		const {
			email,
			password,
			role = "user",
			name = email.split('@', 1)[0].replace('.', ' ')
		} = request.body;
		const record = {email, password,role,name}
		UsersHelper.createUser(record).then(({userID} : User) => {
			if (userID === undefined) return onFailure(new Error("the database is fking"))
			onSuccess(this.issueToken(userID))
		}).catch(onFailure)
	}

	//@DEPRECATED
	static updateUser(user: User, onSuccess: any, onFailure : (error : Error) => void) {
		UsersHelper.updateUser(user).then(onSuccess).catch(onFailure)
	}

	//@DEPRECATED
	static deleteUser(userID: string, onSuccess: any, onFailure : (error : Error) => void) {
		UsersHelper.deleteUser(userID).then(onSuccess).catch(onFailure)
	}

	static loginUser(request: Request, onSuccess: any, onUnauthorised: any, onFailure : (error : Error) => void) {
		const {
			email,
			password
		} = request.body;
		UsersHelper.loginUser(
			{email, password}
			, (userID : string) => onSuccess(this.issueToken(userID))
			, onUnauthorised
			, onFailure)
	}

	static issueToken(userID: string): string {
		const payload = {userID};
		const token: string = jwt.sign(payload, AUTHSECRETKEY, {
			expiresIn: '1400h'
		});
		return token;
	}
}