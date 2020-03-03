import {Permission} from "./Permission";
import {User} from "./User";

export interface CoursePartial {
	ID: string,
	name: string,
	state: string,
	creator: User,
}

export interface Course extends CoursePartial{
	currentUserPermission: Permission
}