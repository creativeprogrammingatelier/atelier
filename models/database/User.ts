import { UUIDHelper, ID64, UUID } from "../../api/src/helpers/UUIDHelper";
import { User as APIUser } from "../api/User";
export interface User {
	userID?: ID64;
	name?: string;
	email?: string;
	role?: string;
	password?: string;
}

export interface DBUser {
	userid: UUID;
	name: string;
	email: string;
	role: string;
	hash?: string;
}

export interface DBAPIUser extends DBUser{
	
}

export function convertUser(db : DBUser) : User{
	return {
		userID:UUIDHelper.fromUUID(db.userid),
		name:db.name,
		email:db.email,
		role:db.role
	}
}

export function userToAPI(db : DBAPIUser) : APIUser {
	return {
		ID: UUIDHelper.fromUUID(db.userid),
		name: db.name,
		email: db.email,
		permission: {
			role:db.role,
			permissions: 2**41-1
		}
	}
}