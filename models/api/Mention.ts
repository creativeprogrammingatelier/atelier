import { User } from "./User";
import { Comment } from "./Comment";

export interface Mention {
	ID: string,
	mentionGroup: string | undefined,
    user: User | undefined,
    comment: Comment,
    submissionTitle: string,
    courseName: string,
	references:{
		commentThreadID : string,
		submissionID : string,
		courseID : string,
	}
}