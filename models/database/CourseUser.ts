
import { DBTools, checkAvailable } from "../../api/src/database/HelperDB";
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper";
import { getEnum } from "../enums/enumHelper";
import { courseRole } from "../enums/courseRoleEnum";
import { globalRole } from "../enums/globalRoleEnum";


export interface CourseUser extends DBTools{
	userID?: string,
	courseID?: string,

	userName?: string,
	email?: string,

	globalRole?: globalRole,
	courseRole?: courseRole,
	permission?: number,
}

export interface DBCourseUser {
	userid: string,
	courseid: string,

	username: string,
	email: string,
	
	globalrole: string,
	courserole: string,
	permission: number,
}

export function convertCourseUser(db : DBCourseUser) : CourseUser{
	checkAvailable(["userid", "courseid", "username", "email", "globalrole", "courserole", "permission"],db)
	return {
		userID: UUIDHelper.fromUUID(db.userid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		userName: db.username,
		email: db.email,
		globalRole: getEnum(globalRole, db.globalrole),
		courseRole: getEnum(courseRole, db.courserole),
		//shhh: this actually comes back as a string, don't tell anyone
		// tslint:disable-next-line: ban
		permission: typeof db.permission === 'string' ? parseInt(db.permission, 2) : db.permission	}
}