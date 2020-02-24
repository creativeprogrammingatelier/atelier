import {Snippet} from "./Snippet";
import {Comment} from "./Comment";

export interface CommentThread {
	id: string,
	visibility: number,
	snippet?: Snippet,
	comments: Comment[]
}