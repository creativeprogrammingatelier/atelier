import {User} from "./User";
import {Comment} from "./Comment";
import {Snippet} from "./Snippet";
import {Course} from "./Course";
import {File} from "./File";
import {Submission} from "./Submission";

export interface SearchResult {
	users: User[],
	courses: Course[],
	submissions: Submission[],
	files: Array<{
	    file: File,
        submission: Submission
    }>,
	comments: Array<{
	    comment: Comment,
        submission: Submission
    }>,
	snippets: Array<{
	    snippet: Snippet,
        file: File,
        submission: Submission
    }>
}