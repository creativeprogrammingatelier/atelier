import {File} from "./File";

export interface Snippet {
	ID: string,
	file: File,
	start: {
		line: number,
		character: number
	},
	end: {
		line: number,
		character: number
	},
	body :string,
	contextBefore : string,
	contextAfter : string,
	references: {
		courseID: string,
		submissionID: string,
		commentThreadID: string
	}
}