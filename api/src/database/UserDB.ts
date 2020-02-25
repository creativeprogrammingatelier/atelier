import {pool, extract, map, one, searchify, pgDB, checkAvailable } from "./HelperDB";
import {User, DBUser, convertUser} from '../../../models/database/User';
import bcrypt from 'bcrypt';
import { UUIDHelper } from "../helpers/UUIDHelper";

/**
 * Users middleware provides helper methods for interacting with users in the DB
 * userID, name, role, email
 * @Author Rens Leendertz
 */

export class UserDB {
	/**
	 * calls onSuccess() with all known users that have the global role 'user', except password hash
	 */
	static async getAllStudents(DB : pgDB = pool) {
		return DB.query(`SELECT userID, name, globalRole, email 
			FROM "Users" 
			WHERE globalRole = 'user'`)
			.then(extract).then(map(convertUser))
	}

	/**
	 * calls onSuccess() with all users in the system.
	 */
	static async getAllUsers(DB : pgDB = pool) {
		return DB.query(`SELECT userID, name, globalRole, email FROM "Users"`)
			.then(extract).then(map(convertUser))
	}

	/**
	 * calls onSuccess() with a student based on its userID, without password hash
	 */
	static async getUserByID(userID : string, DB : pgDB = pool) {
		const userid = UUIDHelper.toUUID(userID);
		return DB.query(`SELECT userID, name, globalRole, email 
			FROM "Users" where userID = $1`, [userid])
			.then(extract).then(map(convertUser)).then(one)
	}

	static async searchUser(searchString : string, limit? : number, DB : pgDB = pool){
		if (limit === undefined || limit < 0) limit=undefined
		searchString = searchify(searchString)
		return DB.query(`SELECT userID, name, globalRole, email
			FROM "Users"
			WHERE name ILIKE $1
			LIMIT $2`, [searchString, limit])
			.then(extract).then(map(convertUser))
	}

	/**
	 * creates a user based on the @param user. 
	 * All fields but userID are required
	 * if a userID is present, it will be ignored.
	 */
	static async createUser(user : User, DB : pgDB = pool) {
		checkAvailable(['email','password','role','name'], user)
		const {
			email,
			password,
			role,
			name
		} = user;
		const hash = password === undefined ? undefined : UserDB.hashPassword(password);
		return DB.query(`INSERT INTO "Users" 
			VALUES (DEFAULT, $1, $2, $3, $4) 
			RETURNING *`, [name, role, email, password])
			.then(extract).then(map(convertUser)).then(one)
	}
	/**
	 * update a user using the @param user.
	 * userID is required to identify the user.
	 * all other fields may or may not be present and will be updated accordingly.
	 */
	static async updateUser(user: User, DB : pgDB = pool) {
		checkAvailable(['userID'], user)
		const {
			userID, //primary key is required
			email = undefined,
			password = undefined,
			role = undefined,
			name = undefined
		} = user
		const userid = UUIDHelper.toUUID(userID);
		const hash = password === undefined ? undefined : UserDB.hashPassword(password)
		return DB.query(`UPDATE "Users"
			SET 
			email = COALESCE($2, email),
			hash = COALESCE($3, hash),
			globalRole = COALESCE($4, globalRole),
			name = COALESCE($5, name)
			WHERE userID = $1
			RETURNING * `, [userid, email, hash, role, name])
			.then(extract).then(map(convertUser)).then(one)
	}

	/**
	 * deletes a user from the database, based on the userID.
	 */
	static async deleteUser(userID: string, DB : pgDB = pool) {
		const userid = UUIDHelper.toUUID(userID);
		return DB.query(`DELETE FROM "Users" 
			WHERE userID = $1 
			RETURNING *`, [userid])
			.then(extract).then(map(convertUser)).then(one)
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
		DB : pgDB = pool) {
		const {
			email,
			password
		} = loginRequest;
		const res = await DB.query<DBUser, [string]>(`SELECT * 
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
		const {hash, userid}= res
		if (userid===undefined){
			return onFailure(Error("the database is fking with us"))
		}
		if (UserDB.comparePassword(hash, password)){
			return onSuccess(userid)
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