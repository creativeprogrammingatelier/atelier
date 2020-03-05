import {pool, extract, map, one, searchify, pgDB, checkAvailable, DBTools } from "./HelperDB";
import {User, DBUser, convertUser, userToAPI} from '../../../models/database/User';
import bcrypt from 'bcrypt';
import { UUIDHelper } from "../helpers/UUIDHelper";

/**
 * Users middleware provides helper methods for interacting with users in the DB
 * userID, userName, role, email
 * @Author Rens Leendertz
 */

export class UserDB {
	/**
	 * calls onSuccess() with all known users that have the global role 'user', except password hash
	 */
	static async getAllStudents(params : DBTools = {}) {
		return UserDB.filterUser({...params, role:'user'})
	}

	/**
	 * calls onSuccess() with all users in the system.
	 */
	static async getAllUsers(params : DBTools = {}) {
		return UserDB.filterUser(params)
	}

	/**
	 * returns a student based on its userID, without password hash
	 */
	static async getUserByID(userID : string, params : DBTools = {}) {
		return UserDB.filterUser({...params, userID}).then(one)
	}

	static async searchUser(searchString : string, params : DBTools ={}){
		return UserDB.filterUser({...params, userName:searchString})
	}

	static async filterUser(user : User){
		const {
			userID = undefined,
			userName = undefined,
			email = undefined,
			role = undefined,

			limit = undefined,
			offset = undefined,
			client = pool
		} = user
		const userid = UUIDHelper.toUUID(userID),
			username = searchify(userName)
		return client.query(`
		SELECT *
		FROM "UsersView"
		WHERE
			($1::uuid IS NULL OR userID = $1)
		AND ($2::text IS NULL OR userName ILIKE $2)
		AND ($3::text IS NULL OR email = $3)
		AND ($4::text IS NULL OR globalrole = $4)
		ORDER BY userName, email --email is unique, so unique ordering
		LIMIT $5
		OFFSET $6
		`, [userid, username, email, role, limit, offset])
		.then(extract).then(map(userToAPI))
	}

	/**
	 * creates a user based on the @param user. 
	 * All fields but userID are required
	 * if a userID is present, it will be ignored.
	 */
	static async createUser(user : User) {
		checkAvailable(['email','password','role','userName'], user)
		const {
			email,
			password,
			role,
			userName,
			client = pool
		} = user;
		const hash = password === undefined ? undefined : UserDB.hashPassword(password);
		return client.query(`
				INSERT INTO "Users" 
				VALUES (DEFAULT, $1, $2, $3, $4) 
				RETURNING userID, userName, globalRole, email
			`, [userName, role, email, password])
			.then(extract).then(map(userToAPI)).then(one)
	}
	/**
	 * update a user using the @param user.
	 * userID is required to identify the user.
	 * all other fields may or may not be present and will be updated accordingly.
	 */
	static async updateUser(user: User) {
		checkAvailable(['userID'], user)
		const {
			userID, //primary key is required
			email = undefined,
			password = undefined,
			role = undefined,
			userName = undefined,

			client = pool
		} = user
		const userid = UUIDHelper.toUUID(userID);
		const hash = password === undefined ? undefined : UserDB.hashPassword(password)
		return client.query(`UPDATE "Users"
			SET 
			email = COALESCE($2, email),
			hash = COALESCE($3, hash),
			globalRole = COALESCE($4, globalRole),
			userName = COALESCE($5, userName)
			WHERE userID = $1
			RETURNING userID, userName, globalRole, email 
			`, [userid, email, hash, role, userName])
			.then(extract).then(map(userToAPI)).then(one)
	}

	/**
	 * deletes a user from the database, based on the userID.
	 */
	static async deleteUser(userID: string, DB : pgDB = pool) {
		const userid = UUIDHelper.toUUID(userID);
		return DB.query(`
			DELETE FROM "Users" 
			WHERE userID = $1 
			RETURNING userID, userName, globalRole, email
			`, [userid])
			.then(extract).then(map(userToAPI)).then(one)
	}

	/**
	 * Checks if a (user, password) combination exists in the database.
	 * this requires parameters 'email' and 'password'
	 * onSuccess will be called with the corresponding userID to proceed with login.
	 */
	static async loginUser(
		loginRequest : {email:string, password:string}, 
		onSuccess: (userID : string) => void, 
		onUnauthorised: () => void, 
		onFailure : (error : Error) => void,
		client : pgDB = pool) {
		const {
			email,
			password
		} = loginRequest;
		const res = await client.query<DBUser, [string]>(`SELECT * 
			FROM "Users" 
			WHERE email = $1`, [email])
			.then(extract).then(one).catch((error : Error) => {
				console.error(error)
				return onFailure(error)
			})
		if (res === undefined){
			return onUnauthorised()
		}
		if (!res.hash){
			return onFailure(Error('WTF is the database doing'))
		}
		const {hash, userid}= res;
		const userID = UUIDHelper.fromUUID(userid);
		if (userID === undefined){
			return onFailure(Error("the database is fking with us"))
		}
		if (UserDB.comparePassword(hash, password)){
			return onSuccess(userID)
		} else {
			return onUnauthorised()
		}
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