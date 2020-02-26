import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import {Snippet as SnippetAPI } from "../api/Snippet"
import { fileToAPI, DBAPIFile } from "./File"
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

export interface DBAPISnippet extends DBSnippet, DBAPIFile {
	courseid: string,
	submissionid: string,
	threadid: string
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
export function snippetToAPI(db : DBAPISnippet) : SnippetAPI {
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
		},
		references: {
			courseID: UUIDHelper.fromUUID(db.courseid),
			submissionID: UUIDHelper.fromUUID(db.submissionid),
			commentThreadID: UUIDHelper.fromUUID(db.commentthreadid)
		}
	}
}