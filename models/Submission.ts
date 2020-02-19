import {submissionStatus, checkEnum} from '../enums/submissionStatusEnum'

export interface Submission {
	submissionID?: string;
	userID?: string;
	name?: string;
	date?: Date;
	state?: submissionStatus;
}

export interface DBSubmission {
	submissionid: string;
	userid: string;
	name: string;
	date: Date;
	state: string;
}

export function convert(db : DBSubmission) : Submission {
	if (!checkEnum(db.state)){
		throw new Error("Enum stored in database doesn't exist: "+db.state)
	}
	return {
		submissionID: db.submissionid,
		userID: db.userid,
		name: db.name,
		date: db.date,
		state: submissionStatus[db.state]
	}
}