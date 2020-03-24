import {File} from "./File";

export interface Selection {
	start: {
		line: number,
		character: number
	},
	end: {
		line: number,
		character: number
	}
}
export interface Snippet extends Selection {
	ID: string,
	file: File,
	body :string,
	contextBefore : string,
	contextAfter : string,
	references: {
		courseID: string,
		submissionID: string,
		commentThreadID: string
	}
}

export const noSelection: Selection = {start: {line: -1, character: -1}, end: {line: -1, character: -1}};