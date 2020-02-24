import {User} from "./User";
import {File} from "./File";

export interface Submission {
	id: string,
	name: string,
	user: User,
	date: string,
	state: string,
	files: File[]
}