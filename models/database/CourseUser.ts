import {UUIDHelper} from "../../api/src/database/helpers/UUIDHelper";
import {DBTools, checkAvailable, toDec} from "../../api/src/database/HelperDB";

import {getEnum} from "../../helpers/EnumHelper";

import {CourseUser as APICourseUser} from "../api/CourseUser";
import {User} from "../api/User";
import {CourseRole} from "../enums/CourseRoleEnum";
import {GlobalRole} from "../enums/GlobalRoleEnum";

export interface CourseUserOutput {
	userID: string,
	courseID: string,
	
	userName: string,
	email: string,
	
	globalRole: GlobalRole,
	courseRole: CourseRole,
	permission: number,
}
export interface CourseUser extends Partial<CourseUserOutput>, DBTools {
	registeredOnly?: boolean
}

export {APICourseUser};
export interface DBCourseUser {
	userid: string,
	courseid: string,
	
	username: string,
	email: string,
	
	globalrole: string,
	courserole: string,
	permission: string,

	canvasrefresh: string
}

export function convertCourseUser(db: DBCourseUser): CourseUserOutput {
	checkAvailable(["userid", "courseid", "username", "email", "globalrole", "courserole", "permission"], db);
	return {
		userID: UUIDHelper.fromUUID(db.userid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		userName: db.username,
		email: db.email,
		globalRole: getEnum(GlobalRole, db.globalrole),
		courseRole: getEnum(CourseRole, db.courserole),
		permission: toDec(db.permission)
	};
}
export function CourseUserToAPI(db: DBCourseUser): APICourseUser {
	checkAvailable(["userid", "courseid", "username", "email", "globalrole", "courserole", "permission"], db);
	return {
		userID: UUIDHelper.fromUUID(db.userid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		userName: db.username,
		email: db.email,
		permission: {
			globalRole: getEnum(GlobalRole, db.globalrole),
			courseRole: getEnum(CourseRole, db.courserole),
			permissions: toDec(db.permission)
		},
		canvasrefresh: db.canvasrefresh
	};
}
export function CourseUserToUser(cu: APICourseUser): User {
	return {
		ID: cu.userID,
		name: cu.userName,
		email: cu.email,
		permission: cu.permission,
		canvasrefresh: cu.canvasrefresh
	};
}