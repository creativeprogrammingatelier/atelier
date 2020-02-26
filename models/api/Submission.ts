import {User} from "./User";
import {File} from "./File";

export interface Submission {
	ID: string,
	name: string,
	user: User,
	date: string,
	state: string,
	files: File[],
	references: {
		courseID: string
	}
}