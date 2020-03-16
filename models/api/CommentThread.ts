import {Snippet} from "./Snippet";
import {Comment} from "./Comment";
import {File} from "./File";
import {threadState} from "../enums/threadStateEnum";

export interface CommentThread {
	ID: string,
	visibility: threadState,
	file?: File,
	snippet?: Snippet,
	comments: Comment[],
	references: {
		courseID: string,
		submissionID : string,
	}
}