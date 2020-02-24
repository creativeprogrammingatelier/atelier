import {User} from "./User";

export interface Comment {
	id: string,
	user: User,
	text: string,
	date: string
}