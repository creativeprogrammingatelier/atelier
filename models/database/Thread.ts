import {threadState, checkEnum} from '../../enums/threadStateEnum'
import {Comment} from './Comment'
import { UUIDHelper } from '../../api/src/helpers/UUIDHelper'
import {CommentThread as ThreadAPI} from '../api/CommentThread'
import { fileToAPI, DBAPIFile } from './File'
import { snippetToAPI, DBAPISnippet } from './Snippet'

export interface Thread {
	commentThreadID?: string,
	submissionID?: string,
	fileID?: string,
	snippetID?: string,
	visibilityState?: threadState
}
export interface DBThread {
	commentthreadid: string,
	submissionid: string,
	fileid: string,
	snippetid: string,
	visibilitystate: string
}
export interface DBAPIThread extends DBThread, DBAPIFile, DBAPISnippet {
	courseID:string
}
export function convertThread(db : DBThread) : Thread {
	if (!(checkEnum(db.visibilitystate))) {
		throw new Error("enum from database not recognized on server"+db.visibilitystate)
	}
	return {
		commentThreadID: UUIDHelper.fromUUID(db.commentthreadid),
		submissionID: UUIDHelper.fromUUID(db.submissionid),
		fileID: UUIDHelper.fromUUID(db.fileid),
		snippetID: UUIDHelper.fromUUID(db.snippetid),
		visibilityState: threadState[db.visibilitystate]
	}
}
export function threadToAPI(db : DBAPIThread) : ThreadAPI{
	if (!(checkEnum(db.visibilitystate))) {
		throw new Error("enum from database not recognized on server"+db.visibilitystate)
	}
	return {
		ID: UUIDHelper.fromUUID(db.commentthreadid),
		submissionID: UUIDHelper.fromUUID(db.submissionid),
		file: fileToAPI(db),
		snippet: snippetToAPI(db),
		visibility: db.visibilitystate,
		comments: [],
		references:{
			courseID: UUIDHelper.fromUUID(db.courseID)
		}
	}
}

export function onlyThread(obj : Thread) : ExtendedThread{
	return {
		commentThreadID: obj.commentThreadID,
		submissionID: obj.submissionID,
		fileID: obj.fileID,
		snippetID: obj.snippetID,
		visibilityState: obj.visibilityState,
		comments: []
	}
}
export interface ExtendedThread extends Thread {
	comments: Comment[],
	snippet? : {
		snippetID : string,
		lineStart : number,
		lineEnd : number,
		charStart : number,
		charEnd : number,
		fileID : string
	}
}