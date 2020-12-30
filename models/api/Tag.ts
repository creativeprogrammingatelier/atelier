import {Comment} from "./Comment";

export interface Tag {
	ID: string,
	tagBody: string,
	comment: Comment,
	submissionTitle: string,
	courseName: string,
	references: {
		commentThreadID: string,
		submissionID: string,
		courseID: string,
	}
	
}