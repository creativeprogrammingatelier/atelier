// import {courseRole} from "../enums/courseRoleEnum"
// import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
// import { Permission as APICourseRegistration} from '../api/Permission'
// import { DBTools, checkAvailable, toDec } from "../../api/src/database/HelperDB"
// import { getEnum } from "../enums/enumHelper"
// import { globalRole } from "../enums/globalRoleEnum"
// export interface CourseRegistrationOutput {
// 	courseID : string,
// 	userID: string,
// 	courseRole : courseRole,
// 	globalRole : globalRole,
// 	permission : number
// }
// export interface CourseRegistration extends DBTools, Partial<CourseRegistrationOutput>{}

// export interface DBCourseRegistration {
// 	courseid : string,
// 	userid : string,
// 	courserole : string,
// 	globalrole : string,
// 	permission : string
// }

// export {APICourseRegistration}

// export type DBAPICourseRegistration = DBCourseRegistration

// export function convertCourseReg(db :DBCourseRegistration) : CourseRegistrationOutput {
// 	checkAvailable(["courseid", "userid", "courserole", "globalRole", "permission"], db)
// 	return {
// 		courseID: UUIDHelper.fromUUID(db.courseid),
// 		userID: UUIDHelper.fromUUID(db.userid),
// 		courseRole: getEnum(courseRole, db.courserole),
// 		globalRole: getEnum(globalRole, db.globalrole),
// 		permission: toDec(db.permission)
// 	}
// }

// export function courseRegToAPI(db : DBAPICourseRegistration) : APICourseRegistration {
// 	checkAvailable(["courserole", "permission"], db)
// 	return {
// 		globalRole: getEnum(globalRole, db.globalrole),
// 		courseRole: getEnum(courseRole, db.courserole),
// 		permissions: toDec(db.permission)
// 	}
// }