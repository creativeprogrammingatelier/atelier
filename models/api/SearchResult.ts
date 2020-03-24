import {User} from "./User";
import {Course} from "./Course";
import {Submission} from "./Submission";
import {Comment} from "./Comment";
import {File} from "./File";
import {Snippet} from "./Snippet";
import { CourseUser } from "./CourseUser";

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
	users: CourseUser[],
	courses: Course[],
	submissions: Submission[],
	comments: SearchResultComment[],
	files: SearchResultFile[],
	snippets: SearchResultSnippet[]
}