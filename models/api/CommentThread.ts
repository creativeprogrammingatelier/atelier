import {Selection, Snippet} from "./Snippet";
import {Comment} from "./Comment";
import {File} from "./File";
import {ThreadState} from "../enums/ThreadStateEnum";
import { User } from "./User";

export interface CommentThread {
	ID: string,
	visibility: ThreadState,
	file?: File,
	snippet?: Snippet,
    comments: Comment[],
    automated: boolean,
    sharedBy?: User,
    submission: {
        name: string,
        user: { 
            ID: string,
            userName: string 
        }
    }
	references: {
		courseID: string,
		submissionID: string,
	}
}

export interface CreateCommentThread {
	comment: string,
	snippet?: Selection,
    visibility?: ThreadState,
    automated?: boolean,
	submissionID: string
}