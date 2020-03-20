import {courseState} from "../enums/courseStateEnum"
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import { Course as APICourse, CoursePartial as APICoursePartial } from "../api/Course"
import { DBAPIUser, userToAPI} from "./User"
import { pgDB, DBTools, checkAvailable } from "../../api/src/database/HelperDB"
import { Permission } from "../api/Permission"
import { getEnum, checkEnum } from "../enums/enumHelper"

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

export type DBAPICourse = DBCourse & DBAPIUser


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

export function coursePartialToAPI(partial : APICoursePartial, permission : Permission) : APICourse {
	return {...partial, currentUserPermission: permission}
}