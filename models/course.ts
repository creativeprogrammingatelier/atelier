import {courseState} from "../enums/courseStateEnum"

export interface ICourse {
	courseid?:number,
	name?: string,
	creatorid?: number,
	state?: courseState
}