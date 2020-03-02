import {submissionStatus, checkEnum} from '../../enums/submissionStatusEnum'
import { UUIDHelper } from '../../api/src/helpers/UUIDHelper'
import { Submission as APISubmission} from '../api/Submission'
import { DBAPIUser, userToAPI } from './User'
import { DBTools, checkAvailable } from '../../api/src/database/HelperDB'

export interface Submission extends DBTools{
	submissionID?: string;
	courseID?: string;
	userID?: string;
	title?: string;
	date?: Date;
	state?: submissionStatus,
	//requires extra database call
	addFiles?: boolean,
}

export interface DBSubmission {
	submissionid: string;
	courseid: string;
	userid: string;
	title: string;
	date: Date;
	state: string;
}

export {APISubmission}

export type DBAPISubmission = DBSubmission & DBAPIUser 

export function convertSubmission(db : DBSubmission) : Submission {
	checkAvailable(["submissionid", "courseid", "userid", "title", "date", "state"], db)
	if (!checkEnum(db.state)){
		throw new Error("Enum stored in database doesn't exist: "+db.state)
	}
	return {
		submissionID: UUIDHelper.fromUUID(db.submissionid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		userID: UUIDHelper.fromUUID(db.userid),
		title: db.title,
		date: db.date,
		state: submissionStatus[db.state]
	}
}
export function submissionToAPI(db : DBAPISubmission) : APISubmission {
	checkAvailable(["submissionid", "courseid", "title", "date", "state"], db)

	if (!checkEnum(db.state)){
		throw new Error("Enum stored in database doesn't exist: "+db.state)
	}
	return {
		ID: UUIDHelper.fromUUID(db.submissionid),
		name: db.title,
		user: userToAPI(db),
		date: db.date.toLocaleDateString(),
		state: db.state,
		files: [],
		references:{
			courseID:db.courseid
		}
	}
}