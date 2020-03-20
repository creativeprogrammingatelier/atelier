import { User } from "./User";

export interface Mention {
	mentionID: string,
	mentionGroup: string | undefined,
	user: User | undefined,
	commentID: string,
	references:{
		commentThreadID : string,
		submissionID : string,
		courseID : string,
	}
}