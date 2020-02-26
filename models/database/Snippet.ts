import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import {Snippet as APISnippet } from "../api/Snippet"
import { fileToAPI, DBAPIFile } from "./File"
export interface Snippet {
	snippetID?: string,
	fileID?: string,
	commentThreadID?:string,
	submissionID?:string,
	courseID?:string,
	lineStart?: number,
	lineEnd?: number,
	charStart?: number,
	charEnd?: number,
	body?: string
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
	body: string
}

export {APISnippet}

export type DBAPISnippet = DBSnippet & DBAPIFile 

export function convertSnippet(db : DBSnippet) : Snippet {
	const ret = {
		snippetID: UUIDHelper.fromUUID(db.snippetid),
		fileID: UUIDHelper.fromUUID(db.fileid),
		commentThreadID: UUIDHelper.fromUUID(db.commentthreadid),
		submissionID: UUIDHelper.fromUUID(db.submissionid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		lineStart: db.linestart,
		lineEnd: db.lineend,
		charStart: db.charstart,
		charEnd: db.charend,
		body: db.body
	}
	// for (const key in db){
	// 	if (key in keys) continue
	// 	ret[key] = db[key]
	// }
	return ret
}
export function snippetToAPI(db : DBAPISnippet) : APISnippet {
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
		references: {
			courseID: UUIDHelper.fromUUID(db.courseid),
			submissionID: UUIDHelper.fromUUID(db.submissionid),
			commentThreadID: UUIDHelper.fromUUID(db.commentthreadid)
		}
	}
}