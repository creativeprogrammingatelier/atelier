
import { DBTools, checkAvailable, toDec } from "../../api/src/database/HelperDB";
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper";
import { getEnum } from "../enums/enumHelper";
import { courseRole } from "../enums/courseRoleEnum";
import { globalRole } from "../enums/globalRoleEnum";
import {CourseUser as APICourseUser } from '../api/CourseUser'
import { User } from "../api/User";
export {APICourseUser}
export interface CourseUserOutput{
	userID: string,
	courseID: string,

	userName: string,
	email: string,

	globalRole: globalRole,
	courseRole: courseRole,
	permission: number,
}
export interface CourseUser extends Partial<CourseUserOutput>, DBTools {
	registeredOnly? : boolean
}

export interface DBCourseUser {
	userid: string,
	courseid: string,

	username: string,
	email: string,
	
	globalrole: string,
	courserole: string,
	permission: string,
}

export function convertCourseUser(db : DBCourseUser) : CourseUserOutput{
	checkAvailable(["userid", "courseid", "username", "email", "globalrole", "courserole", "permission"],db)
	return {
		userID: UUIDHelper.fromUUID(db.userid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		userName: db.username,
		email: db.email,
		globalRole: getEnum(globalRole, db.globalrole),
		courseRole: getEnum(courseRole, db.courserole),
		permission: toDec(db.permission)
	}
}


export function CourseUserToAPI(db : DBCourseUser) : APICourseUser{
	checkAvailable(["userid", "courseid", "username", "email", "globalrole", "courserole", "permission"],db)
	return {
		userID: UUIDHelper.fromUUID(db.userid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		userName: db.username,
		email: db.email,
		permission: {
			globalRole: getEnum(globalRole, db.globalrole),
			courseRole: getEnum(courseRole, db.courserole),
			permissions: toDec(db.permission)
		}
	}
}
export function CourseUserToUser(cu : APICourseUser) : User{
	return {
		ID:cu.userID,
		name:cu.userName,
		email:cu.email,
		permission:cu.permission
	}
}