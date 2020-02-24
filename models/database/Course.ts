import {courseState, checkEnum} from "../../enums/courseStateEnum"

export interface Course {
	courseID?:string,
	name?: string,
	creatorID?: number,
	state?: courseState
}

export interface DBCourse {
	courseid:string,
	name: string,
	creatorid: number,
	state:string
}


export function convertCourse(db : DBCourse) : Course {
	if (!checkEnum(db.state)){
		throw new Error('non-existent enum type from db: '+db.state)
	}
	return {
		courseID:db.courseid,
		name:db.name,
		creatorID:db.creatorid,
		state:courseState[db.state]
	}
}
