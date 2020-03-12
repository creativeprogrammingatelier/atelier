import { UUIDHelper, ID64, UUID } from "../../api/src/helpers/UUIDHelper";
import { User as APIUser } from "../api/User";
import { pgDB, DBTools, checkAvailable } from "../../api/src/database/HelperDB";

export interface User extends DBTools {
	userID?: ID64,
	samlID?: string,
	userName?: string,
	email?: string,
	role?: string,
	permission?: number,
	password?: string,

}

export interface DBUser {
	userid: UUID,
	samlid: string,
	username: string,
	email: string,
	globalrole: string,
	permission: number,
	hash?: string,
}

export {APIUser}

export type DBAPIUser = DBUser

export function convertUser(db : DBUser) : User{
	checkAvailable(["userid", "username", "email", "globalrole", "permission"], db)
	return {
		userID:UUIDHelper.fromUUID(db.userid),
		samlID:db.samlid,
		userName:db.username,
		email:db.email,
		role:db.globalrole,
		//shhh: this actually comes back as a string from the database. don't tell anyone
		// tslint:disable-next-line: ban
		permission:typeof db.permission === 'string' ? parseInt(db.permission, 2) : db.permission,
	}
}

export function userToAPI(db : DBAPIUser) : APIUser {
	checkAvailable(["userid", "username", "email", "globalrole", "permission"], db)
	return {
		ID: UUIDHelper.fromUUID(db.userid),
		name: db.username,
		email: db.email,
		permission: { 
			role:db.globalrole,
			//shhh: this actually comes back as a string from the database. don't tell anyone
			// tslint:disable-next-line: ban
			permissions:typeof db.permission === 'string' ? parseInt(db.permission, 2) : db.permission,
		}
	}
}