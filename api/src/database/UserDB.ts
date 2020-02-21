import {query, extract, map, one} from "./HelperDB";
import {User, DBUser, convertUser} from '../../../models/User';
import bcrypt from 'bcrypt';

/**
 * Users middleware provides helper methods for interacting with users in the DB
 * @Author Rens Leendertz
 */

export class UserDB {
	/**
	 * calls onSuccess() with all known users that have the global role 'user', except password hash
	 */
	static getAllStudents() {
		return query(`SELECT userID, name, globalRole, email 
			FROM "Users" 
			WHERE globalRole = 'user'`)
			.then(extract).then(map(convertUser))
	}

	/**
	 * calls onSuccess() with all users in the system.
	 */
	static getAllUsers() {
		return query(`SELECT userID, name, globalRole, email FROM "Users"`)
			.then(extract).then(map(convertUser))
	}

	/**
	 * calls onSuccess() with a student based on its userID, without password hash
	 */
	static getUserByID(userID : string) {
		return query(`SELECT userID, name, globalRole, email 
			FROM "Users" where userID = $1`, [userID])
			.then(extract).then(map(convertUser)).then(one)
	}

	/**
	 * creates a user based on the @param user. 
	 * All fields but userID are required
	 * if a userID is present, it will be ignored.
	 */
	static createUser(user : User) {
		const {
			email,
			password,
			role,
			name
		} = user;
		const hash = password === undefined ? undefined : UserDB.hashPassword(password);
		return query(`INSERT INTO "Users" 
			VALUES (DEFAULT, $1, $2, $3, $4) 
			RETURNING *`, [name, role, email, password])
			.then(extract).then(map(convertUser)).then(one)
	}
	/**
	 * update a user using the @param user.
	 * userID is required to identify the user.
	 * all other fields may or may not be present and will be updated accordingly.
	 */
	static updateUser(user: User) {
		const {
			userID, //primary key is required
			email = undefined,
			password = undefined,
			role = undefined,
			name = undefined
		} = user
		const hash = password === undefined ? undefined : UserDB.hashPassword(password)
		return query(`UPDATE "Users"
			SET 
			email = COALESCE($2, email),
			hash = COALESCE($3, hash),
			globalRole = COALESCE($4, globalRole),
			name = COALESCE($5, name)
			WHERE userID = $1
			RETURNING * `, [userID, email, hash, role, name])
			.then(extract).then(map(convertUser)).then(one)
	}

	/**
	 * deletes a user from the database, based on the userID.
	 */
	static deleteUser(userID: string) {
		return query(`DELETE FROM "Users" 
			WHERE userID = $1 
			RETURNING *`, [userID])
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
		onFailure : (error : Error) => void) {
		const {
			email,
			password
		} = loginRequest;
		const res = await query<DBUser, [string]>(`SELECT * 
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