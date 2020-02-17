import {courseState} from "../enums/courseStateEnum"

export interface Course {
	courseid?:string,
	name?: string,
	creatorid?: number,
	state?: courseState
}

export interface DBCourse {
	courseid:string,
	name: string,
	creatorid: number,
	state:string
}