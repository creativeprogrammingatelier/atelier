import {courseState, checkEnum} from "../../enums/courseStateEnum"
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import { Course as APICourse } from "../api/Course"
import { DBAPIComment } from "./Comment"
import { DBAPIUser, userToAPI} from "./User"
import { DBAPICourseRegistration } from "./CourseRegistration"
import { courseRegToAPI } from "./CourseRegistration"
export interface Course {
	courseID?:string,
	name?: string,
	creatorID?: string,
	state?: courseState
}

export interface DBCourse {
	courseid:string,
	name: string,
	creatorid: string,
	state:string
}

export interface DBAPICourse extends DBCourse, DBAPIUser, DBAPICourseRegistration{

}


export function convertCourse(db : DBCourse) : Course {
	if (!checkEnum(db.state)){
		throw new Error('non-existent enum type from db: '+db.state)
	}
	return {
		courseID:UUIDHelper.fromUUID(db.courseid),
		name:db.name,
		creatorID:UUIDHelper.fromUUID(db.creatorid),
		state:courseState[db.state]
	}
}
export function convertToAPI(db : DBAPICourse) : APICourse {
	if (!checkEnum(db.state)){
		throw new Error('non-existent enum type from db: '+db.state)
	}
	return {
		ID: UUIDHelper.fromUUID(db.courseid),
		name: db.name,
		state: db.state,
		creator: userToAPI(db),
		currentUserPermission: courseRegToAPI(db)
	}
}
