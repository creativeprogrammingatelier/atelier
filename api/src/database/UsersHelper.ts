const HH = require("./HelperHelper")

import {User} from '../../../models/user2';
import bcrypt from 'bcrypt';

/**
 * Users middleware provides helper methods for interacting with users in the DB
 * @Author Rens Leendertz
 */
const pool = HH.pool

export default class UsersHelper {
	/**
	 * calls onSuccess() with all known users that have the global role 'user', except password hash
	 */
	static getAllStudents(){
		return new Promise((
				resolve : (result : User[]) => void, 
				reject: (error : Error) => void
			) => UsersHelper._getAllStudents(resolve,reject))
	}

	static _getAllStudents(
			onSuccess: (result : User[]) => void, 
			onFailure : (error : Error) => void) {
		pool.query("SELECT userid, name, globalRole, email from \"Users\" WHERE globalRole = 'user'")
			.then((result : {rows:User[]}) => onSuccess(result.rows))
			.catch(onFailure);
	}

	/**
	 * calls onSuccess() with all users in the system.
	 */
	static getAllUsers(){
		return new Promise((
				resolve : (result : User[]) => void, 
				reject: (error : Error) => void
			) => UsersHelper._getAllUsers(resolve,reject))
	}

	static _getAllUsers(
			onSuccess: (result : User[]) => void, 
			onFailure : (error : Error) => void) {
		pool.query("SELECT userid, name, globalRole, email from \"Users\"")
			.then((result : {rows:User[]}) => onSuccess(result.rows))
			.catch(onFailure);
	}

	/**
	 * calls onSuccess() with a student based on its userID, without password hash
	 */
	static getUserByID(userid : string) {
		return new Promise((
				resolve : (result : User) => void, 
				reject: (error : Error) => void
			) => UsersHelper._getUserByID(userid, resolve,reject))
	}

	static _getUserByID(
			userid : string,
			onSuccess: (result : User) => void,
			onFailure : (error : Error) => void) {
		pool.query("SELECT userid, name, globalRole, email from \"Users\" where userid = $1", [userid])
			.then((res : {rows : User[]})=> onSuccess(res.rows[0]))
			.catch((error : Error) => {
				console.error(error)
				onFailure(error)
			});	
	}

	/**
	 * creates a user based on the @param user. 
	 * All fields but userid are required
	 * if a userID is present, it will be ignored.
	 */
	static createUser(user : User){
		return new Promise((
				resolve : (result : User) => void, 
				reject: (error : Error) => void
			) => UsersHelper._createUser(user, resolve,reject))
	}

	static _createUser(
			user : User,
			onSuccess : (result : User) => void,
			onFailure : (error : Error) => void) {
		const {
			email,
			password,
			role,
			name
		} = user;
		pool.query("INSERT INTO \"Users\" VALUES (DEFAULT, $1, $2, $3, $4) RETURNING userid;", [name, role, email, password])
			.then((res : {rows:User[]}) => {
				onSuccess(res.rows[0])
			})
			.catch(onFailure);
	}
	/**
	 * update a user using the @param user.
	 * userID is required to identify the user.
	 * all other fields may or may not be present and will be updated accordingly.
	 */
	static updateUser(user: User){
		return new Promise((
				resolve : (result : User) => void, 
				reject: (error : Error) => void
			) => UsersHelper._updateUser(user, resolve,reject))
	}

	static _updateUser(
			user: User,
			onSuccess: (result : User) => void,
			onFailure : (error : Error) => void) {
		const {
			userid, //primary key is required
			email = undefined,
			password = undefined,
			role = undefined,
			name = undefined
		} = user
		const hash = password === undefined ? undefined : UsersHelper.hashPassword(password)
		pool.query(`UPDATE \"Users\"
			SET 
			email = COALESCE($2, email),

			hash = COALESCE($3, hash),

			globalRole = COALESCE($4, globalRole),

			name = COALESCE($5, name)

			WHERE userid = $1
			RETURNING * `, [userid, email, hash, role, name])
			.then((res : {rows:User[]}) => onSuccess(res.rows[0]))
			.catch(onFailure);
	}

	/**
	 * deletes a user from the database, based on the userID.
	 */
	static deleteUser(userid: string) : Promise<void>{
		return new Promise((
				resolve : () => void, 
				reject: (error : Error) => void
			) => UsersHelper._deleteUser(userid, resolve,reject))
	}

	static _deleteUser(
			userid: string,
			onSuccess: () => void,
			onFailure : (error : Error) => void) {
		pool.query("DELETE FROM \"Users\" WHERE userid = $1", [userid])
			.then(onSuccess)
			.catch(onFailure);
	}

	/**
	 * Checks if a (user, password) combination exists in the database.
	 * this requires parameters 'email' and 'password'
	 * onSuccess will be called with the corresponding userID to proceed with login.
	 */
	static loginUser(
		loginRequest : {email:string, password:string}, 
		onSuccess: (userid : string) => void, 
		onUnauthorised: () => void, 
		onFailure : (error : Error) => void) {
		const {
			email,
			password
		} = loginRequest;
		pool.query("SELECT userid, name, globalRole, email, hash as password FROM \"Users\" where email = $1", [email])
			.then((res : {rows:User[]}) => {
				if (res.rows.length !== 1){
					return onUnauthorised()
				}
				if (!res.rows[0].password){
					return onFailure(Error('WTF is the database doing'))
				}
				const hash : string = res.rows[0].password;
				const {userid}= res.rows[0]
				if (userid===undefined){
					return onFailure(Error("the database is fking with us"))
				}
				if (UsersHelper.comparePassword(hash, password)){
					return onSuccess(userid)
				} else {
					return onUnauthorised()
				}
			})
			.catch((error : Error) => {
				console.error(error)
				return onFailure(error)
			});	
	}

	/**
	 * 2 private methods to handle password hashing and comparing.
	 */
	private static comparePassword(hash: string, plain: string): boolean {
		return bcrypt.compareSync(plain, hash);
	}
	private static hashPassword(plain: string): string {
		const saltRounds=10;
		return bcrypt.hashSync(plain, saltRounds);
	}
}