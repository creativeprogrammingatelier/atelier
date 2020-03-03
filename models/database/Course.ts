import {courseState, checkEnum} from "../../enums/courseStateEnum"
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import { Course as APICourse, CoursePartial as APICoursePartial } from "../api/Course"
import { DBAPIUser, userToAPI} from "./User"
import { DBAPICourseRegistration } from "./CourseRegistration"
import { courseRegToAPI } from "./CourseRegistration"
import { pgDB, DBTools, checkAvailable } from "../../api/src/database/HelperDB"
import { APIPermission } from "./RolePermission"

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
	if (!checkEnum(db.state)){
		throw new Error('non-existent enum type from db: '+db.state)
	}
	return {
		courseID:UUIDHelper.fromUUID(db.courseid),
		courseName:db.coursename,
		creatorID:UUIDHelper.fromUUID(db.creatorid),
		state:courseState[db.state]
	}
}
export function courseToAPIPartial(db : DBAPICourse) : APICoursePartial {
	checkAvailable(["courseid", "coursename", "state"], db)
	if (!checkEnum(db.state)){
		throw new Error('non-existent enum type from db: '+db.state)
	}
	return {
		ID: UUIDHelper.fromUUID(db.courseid),
		name: db.coursename,
		state: db.state,
		creator: userToAPI(db),
	}
}

export function coursePartialToAPI(partial : APICoursePartial, permission : APIPermission) : APICourse {
	return {...partial, currentUserPermission: permission}
}