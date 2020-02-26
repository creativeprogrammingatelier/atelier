import {Permission} from "./Permission";
import {User} from "./User";

export interface Course {
	ID: string,
	name: string,
	state: string,
	creator: User,
	currentUserPermission: Permission
}