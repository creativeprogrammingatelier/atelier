import { Permission } from "./Permission";

export interface CourseUser{
	userID: string,
	courseID: string,
	userName: string,
	email: string,
	permission : Permission
}