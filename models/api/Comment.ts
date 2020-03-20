import {User} from "./User";

export interface Comment {
	ID: string,
	user: User,
	text: string,
	created: string,
	edited: string,
	references: {
		courseID: string,
		submissionID: string,
		commentThreadID: string,
		fileID: string,
		snippetID: string,
	}
}