import {User} from "./User";

export interface Comment {
	ID: string,
	user: User,
	text: string,
	date: string,
	references: {
		courseID: string,
		submissionID: string,
		commentThreadID: string,
		fileID: string,
		snippetID: string,
	}
}