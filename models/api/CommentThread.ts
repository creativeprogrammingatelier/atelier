import {Snippet} from "./Snippet";
import {Comment} from "./Comment";
import {File} from "./File";

export interface CommentThread {
	ID: string,
	visibility: string,
	file?: File,
	snippet?: Snippet,
	comments: Comment[],
	references: {
		courseID: string,
		submissionID : string,
	}
}