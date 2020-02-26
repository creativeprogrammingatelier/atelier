import {localRole, checkEnum} from "../../enums/localRoleEnum"
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import { Permission as APICourseRegistration} from '../api/Permission'
export interface CourseRegistration {
	courseID? : string,
	userID? : string,
	role? : localRole,
	permission? : number
}
export interface DBCourseRegistration {
	courseid : string,
	userid : string,
	courserole : string,
	permission : number
}

export interface DBAPICourseRegistration extends DBCourseRegistration{

}

export function convertCourseReg(db :DBCourseRegistration) : CourseRegistration {
	if (!checkEnum(db.courserole)){
		throw new Error("courserole from database does not match enum on server: "+db.courserole)
	}
	return {
		courseID: UUIDHelper.fromUUID(db.courseid),
		userID: UUIDHelper.fromUUID(db.userid),
		role: localRole[db.courserole],
		permission: db.permission
	}
}

export function courseRegToAPI(db : DBAPICourseRegistration) : APICourseRegistration {
	return {
		role: db.courserole,
		permissions: db.permission
	}
}