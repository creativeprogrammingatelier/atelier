import {submissionStatus, checkEnum} from '../../enums/submissionStatusEnum'
import { UUIDHelper } from '../../api/src/helpers/UUIDHelper'
import { Submission as APISubmission} from '../api/Submission'
import { DBAPIUser, userToAPI } from './User'

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

export {APISubmission}

export type DBAPISubmission = DBSubmission & DBAPIUser 

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
export function submissionToAPI(db : DBAPISubmission) : APISubmission {
	if (!checkEnum(db.state)){
		throw new Error("Enum stored in database doesn't exist: "+db.state)
	}
	return {
		ID: UUIDHelper.fromUUID(db.submissionid),
		name: db.name,
		user: userToAPI(db),
		date: db.date.toLocaleDateString(),
		state: db.state,
		files: [],
		references:{
			courseID:db.courseid
		}
	}
}