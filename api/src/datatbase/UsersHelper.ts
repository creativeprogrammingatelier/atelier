const HH = require("./HelperHelper")

import jwt from 'jsonwebtoken';
import {Constants} from '../lib/constants';
import {Request, Response} from 'express';
import {IUser} from '../../../models/user2';
import bcrypt from 'bcrypt';

/**
 * Users middleware provides helper methods for interacting with users in the DB
 * @Author Rens Leendertz
 */
const pool = HH.pool

export default class UsersHelper {
	static getAllStudents(onSuccess: Function, onFailure: Function) {
		pool.query("SELECT userid, name, globalRole, email from \"Users\" WHERE globalRole = 'user'")
			.then((result : any) => onSuccess(result.rows))
			.catch((error : Error) => onFailure(error));
	}

	static getAllUsers(onSuccess: Function, onFailure: Function) {
		pool.query("SELECT userid, name, globalRole, email from \"Users\"")
			.then((result : any) => onSuccess(result.rows))
			.catch((error : Error) => onFailure(error));
	}
	/**
	 * Get the user object corresponding to the request
	 * @param {*} request
	 * @param {*} next callback

	 * @TODO don't put request objects in db helper
	 */
	static getUser(request: Request, onSuccess: Function, onFailure: Function) {
		const token = (request.headers && request.headers.authorization) ? request.headers.authorization : undefined;
		if (token != undefined) {
			jwt.verify(token, Constants.AUTHSECRETKEY, (error: Error, decoded: any) => {
				if (error) {
					onFailure(error);
				} else {
					let userid = decoded.userid;
					this.getUserByID(userid, (res : Array<IUser>) =>{
						onSuccess(res, request)
					}, onFailure);
				}
			});
		} else {
			onFailure();
		}
	}

	static getUserByID(userid : number, onSuccess: Function, onFailure: Function) {
		pool.query("SELECT userid, name, globalRole, email from \"Users\" where userid = $1", [userid])
			.then((res : {rows : Array<IUser>})=> onSuccess(res.rows))
			.catch((error : Error) => {
				console.error(error)
				onFailure(error)
			});	
	}

	/**
	* @TODO don't put request objects in db helper
	*/
	static createUser(request: Request, onSuccess: Function, onFailure: Function) {
		// @TODO: extend registration page for name?
		const {
			email,
			password,
			role = "user",
			name = email.split('@', 1)[0].replace('.', ' ')
		} = request.body;
		const record = {email:email, password:password,role:role,name:name}
		this.createUserActual(record, (res : any) => {
			onSuccess(this.issueToken(res.userid))
		}, onFailure)
	}
	static createUserActual(user : IUser, onSuccess : Function, onFailure : Function) {
		const {
			email,
			password,
			role,
			name
		} = user;
		pool.query("INSERT INTO \"Users\" VALUES (DEFAULT, $1, $2, $3, $4) RETURNING userid;", [name, role, email, password])
			.then((res : {rows:Array<IUser>}) => {
				onSuccess(res.rows[0])
			})
			.catch((error : Error) => onFailure(error));
	}

	static updateUser(user: IUser, onSuccess: Function, onFailure: Function) {
		const {
			userid, //primary key is required
			email = undefined,
			password = undefined,
			role = undefined,
			name = undefined
		} = user
		let hash = password === undefined ? undefined : this.hashPassword(password)
		onFailure([user, [userid, email, hash, role, name]])
		pool.query(`UPDATE \"Users\"
			SET 
			email = COALESCE($2, email),

			hash = COALESCE($3, hash),

			globalRole = COALESCE($4, globalRole),

			name = COALESCE($5, name)

			WHERE userid = $1`, [userid, email, hash, role, name])
			.then(onSuccess())
			.catch((error : Error) => onFailure(error));
	}

	static deleteUser(userid: number, onSuccess: Function, onFailure: Function) {
		pool.query("DELETE FROM \"Users\" WHERE userid = $1", [userid])
			.then(onSuccess())
			.catch((error : Error) => onFailure(error));
	}

	/**
	* @TODO don't put request objects in db helper
	*/
	static loginUser(request: Request, onSuccess: Function, onUnauthorised: Function, onFailure: Function) {
		const {
			email,
			password
		} = request.body;
		pool.query("SELECT userid, name, globalRole, email, hash FROM \"Users\" where email = $1", [email])
			.then((res : any) => {
				if (res.rows.length !== 1){
					onUnauthorised()
				}
				let hash = res.rows[0].hash;
				let userid = res.rows[0].userid;
				if (this.comparePassword(hash, password)){
					onSuccess(this.issueToken(userid))
				} else {
					onUnauthorised()
				}
				
			})
			.catch((error : Error) => {
				console.error(error)
				onFailure(error)
			});	
	}
	/**
	*@TODO make a jwt helper instead of this
	*/
	public static issueToken(userid: number): string {
		const payload = {userid:userid};
		const token: string = jwt.sign(payload, Constants.AUTHSECRETKEY, {
			expiresIn: '1h'
		});
		return token;
	}


	private static comparePassword(hash: string, plain: string): boolean {
		return bcrypt.compareSync(plain, hash);
	}
	private static hashPassword(plain: string): string {
		let saltRounds=10;
		return bcrypt.hashSync(plain, saltRounds);
	}
}