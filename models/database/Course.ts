import {courseState} from "../enums/courseStateEnum"
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import { Course as APICourse, CoursePartial as APICoursePartial } from "../api/Course"
import { DBAPIUser, userToAPI, DBUser} from "./User"
import { pgDB, DBTools, checkAvailable, toDec } from "../../api/src/database/HelperDB"
import { Permission } from "../api/Permission"
import { getEnum, checkEnum } from "../enums/enumHelper"
import { globalRole } from "../enums/globalRoleEnum"
import { courseRole } from "../enums/courseRoleEnum"

export interface Course extends DBTools {
	courseID?:string,
	courseName?: string,
	creatorID?: string,
	state?: courseState
}

export interface DBCourse {
	courseid:string,
	coursename: string,
	creatorid: string,
	state:string
}

export {APICourse}

export type DBAPICourse = DBCourse & DBUser

export interface DBCourseExt extends DBAPICourse{
	currentglobalrole : string,
	currentcourserole : string,
	currentpermission : string
}

export function convertCourse(db : DBCourse) : Course {
	checkAvailable(["courseid", "coursename", "creatorid", "state"], db)
	return {
		courseID:UUIDHelper.fromUUID(db.courseid),
		courseName:db.coursename,
		creatorID:UUIDHelper.fromUUID(db.creatorid),
		state: getEnum(courseState, db.state)
	}
}
export function courseToAPIPartial(db : DBAPICourse) : APICoursePartial {
	checkAvailable(["courseid", "coursename", "state", "creator"], db)
	return {
		ID: UUIDHelper.fromUUID(db.courseid),
		name: db.coursename,
		state: getEnum(courseState, db.state),
		creator: userToAPI(db),
	}
}

export function courseToAPI(db : DBCourseExt) : APICourse {
	checkAvailable(["courseid", "coursename", "state", "creator"], db)
	return {
		...courseToAPIPartial(db),
		currentUserPermission: {
			globalRole: getEnum(globalRole, db.currentglobalrole),
			courseRole: getEnum(courseRole, db.currentcourserole),
			permissions: toDec(db.currentpermission)
		}
	}
}


export function coursePartialToAPI(partial : APICoursePartial, permission : Permission) : APICourse {
	return {...partial, currentUserPermission: permission}
}