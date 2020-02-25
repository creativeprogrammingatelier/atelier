import {courseState, checkEnum} from "../../enums/courseStateEnum"
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"

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
