import {localRoles} from "../enums/localRoleEnum"

export interface CourseRegistration {
	courseid? : string,
	userid? : string,
	role? : localRoles,
	permission? : number
}
export interface DBCourseRegistration {
	courseid : string,
	userid : string,
	courserole : string,
	permission : number
}