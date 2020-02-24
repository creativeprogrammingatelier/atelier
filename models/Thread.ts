import {threadState, checkEnum} from '../enums/threadStateEnum'

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
		commentThreadID: db.commentthreadid,
		submissionID: db.submissionid,
		fileID: db.fileid,
		snippetID: db.snippetid,
		visibilityState: threadState[db.visibilitystate]
	}
}