import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import {Snippet as SnippetAPI } from "../api/Snippet"
import { fileToAPI, DBFile } from "./File"
export interface Snippet {
	snippetID?: string,
	lineStart?: number,
	lineEnd?: number,
	charStart?: number,
	charEnd?: number,
	fileID?: string
}

export interface DBSnippet {
	snippetid: string,
	linestart: number,
	lineend: number,
	charstart: number,
	charend: number,
	fileid: string
}
const keys = ['snippetid', 'linestart', 'lineend', 'charstart', 'charend', 'fileid']
export function convertSnippet(db : DBSnippet) : Snippet {
	const ret = {
		snippetID: UUIDHelper.fromUUID(db.snippetid),
		lineStart: db.linestart,
		lineEnd: db.lineend,
		charStart: db.charstart,
		charEnd: db.charend,
		fileID: UUIDHelper.fromUUID(db.fileid)
	}
	// for (const key in db){
	// 	if (key in keys) continue
	// 	ret[key] = db[key]
	// }
	return ret
}
export function snippetToAPI(db : DBSnippet & DBFile) : SnippetAPI {
	return {
		ID: UUIDHelper.fromUUID(db.snippetid),
		file: fileToAPI(db),
		start: {
			line: db.linestart,
			character: db.charstart
		},
		end: {
			line: db.lineend,
			character: db.charend
		}
	}
}