import { UUIDHelper, ID64, UUID } from "../../api/src/helpers/UUIDHelper";

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

export function convertUser(db : DBUser) : User{
	return {
		userID:UUIDHelper.fromUUID(db.userid),
		name:db.name,
		email:db.email,
		role:db.role
	}
}