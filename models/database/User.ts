import { UUIDHelper, ID64, UUID } from "../../api/src/helpers/UUIDHelper";
import { User as APIUser } from "../api/User";
import { pgDB, DBTools, checkAvailable } from "../../api/src/database/HelperDB";

export interface User extends DBTools {
	userID?: ID64,
	samlID?: string,
	userName?: string,
	email?: string,
	role?: string,
	password?: string,

}

export interface DBUser {
	userid: UUID,
	samlid: string,
	username: string,
	email: string,
	globalrole: string,
	hash?: string,
}

export {APIUser}

export type DBAPIUser = DBUser

export function convertUser(db : DBUser) : User{
	return {
		userID:UUIDHelper.fromUUID(db.userid),
		samlID:db.samlid,
		userName:db.username,
		email:db.email,
		role:db.globalrole
	}
}

export function userToAPI(db : DBAPIUser) : APIUser {
	checkAvailable(["userid", "username", "email", "globalrole"], db)
	return {
		ID: UUIDHelper.fromUUID(db.userid),
		name: db.username,
		email: db.email,
		//@TODO? this is not supported by the database whatsoever, maybe change it to more accurately represent it.
		permission: { 
			role:db.globalrole,
			permissions: 2**40-1
		}
	}
}