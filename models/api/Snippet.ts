import {File} from "./File";

export interface Snippet {
	id: string,
	file: File,
	start: {
		line: number,
		character: number
	},
	end: {
		line: number,
		character: number
	}
}