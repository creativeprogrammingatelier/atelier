import {Selection, Snippet} from "./Snippet";
import {Comment} from "./Comment";
import {File} from "./File";
import {ThreadState} from "../enums/ThreadStateEnum";

export interface CommentThread {
	ID: string,
	visibility: ThreadState,
	file?: File,
	snippet?: Snippet,
	comments: Comment[],
	references: {
		courseID: string,
		submissionID: string,
	}
}

export interface CreateCommentThread {
	comment: string,
	snippet?: Selection,
	visibility?: ThreadState,
	submissionID: string
}