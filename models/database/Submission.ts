import {submissionStatus, checkEnum} from '../../enums/submissionStatusEnum'
import { brotliDecompress } from 'zlib'
import { UUIDHelper } from '../../api/src/helpers/UUIDHelper'

export interface Submission {
	submissionID?: string;
	courseID?: string;
	userID?: string;
	name?: string;
	date?: Date;
	state?: submissionStatus;
}

export interface DBSubmission {
	submissionid: string;
	courseid: string;
	userid: string;
	name: string;
	date: Date;
	state: string;
}

export function convertSubmission(db : DBSubmission) : Submission {
	if (!checkEnum(db.state)){
		throw new Error("Enum stored in database doesn't exist: "+db.state)
	}
	return {
		submissionID: UUIDHelper.fromUUID(db.submissionid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		userID: UUIDHelper.fromUUID(db.userid),
		name: db.name,
		date: db.date,
		state: submissionStatus[db.state]
	}
}