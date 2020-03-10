import {threadState, checkEnum} from '../../enums/threadStateEnum'
import { UUIDHelper } from '../../api/src/helpers/UUIDHelper'
import {CommentThread as APIThread} from '../api/CommentThread'
import { fileToAPI, DBAPIFile, isNotNullFile } from './File'
import { snippetToAPI, DBAPISnippet, isNotNullSnippet } from './Snippet'
import { DBTools, checkAvailable } from '../../api/src/database/HelperDB'

export interface Thread extends DBTools{
	commentThreadID?: string,
	submissionID?: string,
	courseID?: string,
	fileID?: string,
	snippetID?: string,
	visibilityState?: threadState,
	//requires extra database call
	addComments?:boolean,
}
export interface DBThread {
	commentthreadid: string,
	submissionid: string,
	courseid: string,
	fileid: string,
	snippetid: string,
	visibilitystate: threadState
}

export {APIThread}

export type DBAPIThread = DBThread & DBAPIFile & DBAPISnippet

export function convertThread(db : DBThread) : Thread {
	if (!(checkEnum(db.visibilitystate))) {
		throw new Error("enum from database not recognized on server"+db.visibilitystate)
	}
	return {
		commentThreadID: UUIDHelper.fromUUID(db.commentthreadid),
		submissionID: UUIDHelper.fromUUID(db.submissionid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		fileID: UUIDHelper.fromUUID(db.fileid),
		snippetID: UUIDHelper.fromUUID(db.snippetid),
		visibilityState: threadState[db.visibilitystate]
	}
}
export function threadToAPI(db : DBAPIThread) : APIThread{
	checkAvailable(["commentthreadid", "visibilitystate", "courseid", "submissionid"], db)
	if (!(checkEnum(db.visibilitystate))) {
		throw new Error("enum from database not recognized on server"+db.visibilitystate)
	}
	const obj = {
		ID: UUIDHelper.fromUUID(db.commentthreadid),
		file: fileToAPI(db),
		snippet: snippetToAPI(db),
		visibility: db.visibilitystate as threadState,
		comments: [],
		references:{
			courseID: UUIDHelper.fromUUID(db.courseid),
			submissionID: UUIDHelper.fromUUID(db.submissionid),

		}
	}
	if (!isNotNullSnippet(obj.snippet)){
		delete obj.snippet
		if (!isNotNullFile(obj.file)) {
			delete obj.file
		}
	}
	return obj;
}