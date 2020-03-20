import { UUIDHelper, ID64, UUID } from "../../api/src/helpers/UUIDHelper";
import { User as APIUser } from "../api/User";
import { pgDB, DBTools, checkAvailable, toDec } from "../../api/src/database/HelperDB";
import { globalRole } from "../enums/globalRoleEnum";
import { getEnum } from "../enums/enumHelper";

export interface User extends DBTools {
	userID?: string,
	samlID?: string,
	userName?: string,
	email?: string,
	globalRole?: globalRole,
	permission?: number,
	password?: string,

}

export interface DBUser {
	userid: UUID,
	samlid: string,
	username: string,
	email: string,
	globalrole: string,
	permission: string,
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
		globalRole:getEnum(globalRole, db.globalrole),
		permission:toDec(db.permission)
	}
}

export function userToAPI(db : DBAPIUser) : APIUser {
	checkAvailable(["userid", "username", "email", "globalrole", "permission"], db)
	return {
		ID: UUIDHelper.fromUUID(db.userid),
		name: db.username,
		email: db.email,
		permission: { 
			globalRole:getEnum(globalRole, db.globalrole),
			permissions:toDec(db.permission)
		}
	}
}