import {courseRole} from "../enums/courseRoleEnum"
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import { Permission as APICourseRegistration} from '../api/Permission'
import { DBTools, checkAvailable } from "../../api/src/database/HelperDB"
import { getEnum } from "../enums/enumHelper"
export interface CourseRegistrationOutput {
	courseID : string,
	userID: string,
	role : courseRole,
	permission : number
}
export interface CourseRegistration extends DBTools, Partial<CourseRegistrationOutput>{}

export interface DBCourseRegistration {
	courseid : string,
	userid : string,
	courserole : string,
	permission : number
}

export {APICourseRegistration}

export type DBAPICourseRegistration = DBCourseRegistration

export function convertCourseReg(db :DBCourseRegistration) : CourseRegistrationOutput {
	checkAvailable(["courseid", "userid", "courserole", "permission"], db)
	return {
		courseID: UUIDHelper.fromUUID(db.courseid),
		userID: UUIDHelper.fromUUID(db.userid),
		role: getEnum(courseRole, db.courserole),
		//shhh: this actually comes back as a string, don't tell anyone
		// tslint:disable-next-line: ban
		permission: typeof db.permission === 'string' ? parseInt(db.permission, 2) : db.permission
	}
}

export function courseRegToAPI(db : DBAPICourseRegistration) : APICourseRegistration {
	checkAvailable(["courserole", "permission"], db)
	return {
		role: getEnum(courseRole, db.courserole),
		//shhh: this actually comes back as a string, don't tell anyone
		// tslint:disable-next-line: ban
		permissions: typeof db.permission === 'string' ? parseInt(db.permission, 2) : db.permission
	}
}