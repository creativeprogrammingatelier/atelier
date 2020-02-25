import {threadState, checkEnum} from '../../enums/threadStateEnum'
import {Comment} from './Comment'
import { UUIDHelper } from '../../api/src/helpers/UUIDHelper'
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