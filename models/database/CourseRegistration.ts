import {localRole, checkEnum} from "../../enums/localRoleEnum"
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import { Permission as APICourseRegistration} from '../api/Permission'
import { DBTools, checkAvailable } from "../../api/src/database/HelperDB"
export interface CourseRegistrationOutput {
	courseID : string,
	userID: string,
	role : localRole,
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
	if (!checkEnum(db.courserole)){
		throw new Error("courserole from database does not match enum on server: "+db.courserole)
	}
	return {
		courseID: UUIDHelper.fromUUID(db.courseid),
		userID: UUIDHelper.fromUUID(db.userid),
		role: localRole[db.courserole],
		//shhh: this actually comes back as a string, don't tell anyone
		// tslint:disable-next-line: ban
		permission: typeof db.permission === 'string' ? parseInt(db.permission, 2) : db.permission
	}
}

export function courseRegToAPI(db : DBAPICourseRegistration) : APICourseRegistration {
	checkAvailable(["courserole", "permission"], db)
	return {
		role: db.courserole,
		//shhh: this actually comes back as a string, don't tell anyone
		// tslint:disable-next-line: ban
		permissions: typeof db.permission === 'string' ? parseInt(db.permission, 2) : db.permission
	}
}