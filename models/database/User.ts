export interface User {
	userID?: string;
	name?: string;
	email?: string;
	role?: string;
	password?: string;
}

export interface DBUser {
	userid: string;
	name: string;
	email: string;
	role: string;
	hash?: string;
}

export function convertUser(db : DBUser) : User{
	return {
		userID:db.userid,
		name:db.name,
		email:db.email,
		role:db.role
	}
}