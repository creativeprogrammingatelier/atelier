import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import {Snippet as APISnippet } from "../api/Snippet"
import { fileToAPI, DBAPIFile } from "./File"
import { pgDB, DBTools, checkAvailable } from "../../api/src/database/HelperDB"
export interface Snippet extends DBTools{
	snippetID?: string,
	fileID?: string,
	commentThreadID?:string,
	submissionID?:string,
	courseID?:string,
	lineStart?: number,
	lineEnd?: number,
	charStart?: number,
	charEnd?: number,
	body?: string,
	contextBefore? : string,
	contextAfter? : string,
	includeNulls?:boolean,

}

export interface DBSnippet {
	snippetid: string,
	fileid: string,
	commentthreadid: string,
	submissionid: string,
	courseid: string,
	linestart: number,
	lineend: number,
	charstart: number,
	charend: number,
	body: string,
	contextbefore:string,
	contextafter:string,

}

export {APISnippet}

export type DBAPISnippet = DBSnippet & DBAPIFile 

export function filterNullSnippet(snippets : APISnippet[]){
	return snippets.filter(isNotNullSnippet)
}

export function isNotNullSnippet(snippet : APISnippet){
	return snippet.start.line !== -1
}

export function convertSnippet(db : DBSnippet) : Snippet {
	checkAvailable(["snippetid", "linestart", "charstart", "lineend", "charend", "body"], db)
	const ret = {
		snippetID: UUIDHelper.fromUUID(db.snippetid),
		lineStart: db.linestart,
		lineEnd: db.lineend,
		charStart: db.charstart,
		charEnd: db.charend,
		body: db.body,
		contextBefore: db.contextbefore,
		contextAfter: db.contextafter,
	}
	// for (const key in db){
	// 	if (key in keys) continue
	// 	ret[key] = db[key]
	// }
	return ret
}
export function snippetToAPI(db : DBAPISnippet) : APISnippet {
	checkAvailable(["snippetid", "linestart", "charstart", 
					"lineend", "charend", "body", 
					"contextbefore", "contextafter",
					"courseid", "submissionid", "commentthreadid"], db)
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
		body : db.body,
		contextBefore: db.contextbefore,
		contextAfter: db.contextafter,
		references: {
			courseID: UUIDHelper.fromUUID(db.courseid),
			submissionID: UUIDHelper.fromUUID(db.submissionid),
			commentThreadID: UUIDHelper.fromUUID(db.commentthreadid)
		}
	}
}