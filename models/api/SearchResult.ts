import {Comment} from "./Comment";
import {Course} from "./Course";
import {File} from "./File";
import {Snippet} from "./Snippet";
import {Submission} from "./Submission";
import {User} from "./User";

export interface SearchResultComment {
	comment: Comment,
	submission: Submission
}
export interface SearchResultFile {
	file: File,
	submission: Submission
}
export interface SearchResultSnippet {
	snippet: Snippet,
	file: File,
	submission: Submission
}
export interface SearchResult {
	users: User[],
	courses: Course[],
	submissions: Submission[],
	comments: SearchResultComment[],
	files: SearchResultFile[],
	snippets: SearchResultSnippet[]
}