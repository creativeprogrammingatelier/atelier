import { UUIDHelper, ID64, UUID } from "../../api/src/helpers/UUIDHelper";
import { User as APIUser } from "../api/User";
import { pgDB, DBTools, checkAvailable, toDec } from "../../api/src/database/HelperDB";
import { GlobalRole } from "../enums/GlobalRoleEnum";
import { getEnum } from "../enums/enumHelper";

export interface User extends DBTools {
	userID?: string,
	samlID?: string,
	userName?: string,
	email?: string,
	globalRole?: GlobalRole,
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
		globalRole:getEnum(GlobalRole, db.globalrole),
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
			globalRole:getEnum(GlobalRole, db.globalrole),
			permissions:toDec(db.permission)
		}
	}
}