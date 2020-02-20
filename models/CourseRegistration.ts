import {localRole, checkEnum} from "../enums/localRoleEnum"

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
export function convertCourseReg(db :DBCourseRegistration) : CourseRegistration {
	if (!checkEnum(db.courserole)){
		throw new Error("courserole from database does not match enum on server: "+db.courserole)
	}
	return {
		courseID: db.courseid,
		userID: db.userid,
		role: localRole[db.courserole],
		permission: db.permission
	}
}