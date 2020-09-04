import {UUIDHelper} from "../../api/src/helpers/UUIDHelper";
import {DBTools, checkAvailable} from "../../api/src/database/HelperDB";

import {getEnum} from "../../helpers/EnumHelper";

import {Submission as APISubmission} from "../api/Submission";
import {SubmissionStatus} from "../enums/SubmissionStatusEnum";

import {DBAPIUser, userToAPI} from "./User";

export interface Submission extends DBTools {
	submissionID?: string;
    courseID?: string;
    courseName?: string;
	userID?: string;
	title?: string;
	date?: Date;
	state?: SubmissionStatus,
	//requires extra database call
	addFiles?: boolean,
}
export interface DBSubmission {
	submissionid: string;
    courseid: string;
    coursename: string;
	userid: string;
	title: string;
	date: Date;
	state: string;
}

export {APISubmission};
export type DBAPISubmission = DBSubmission & DBAPIUser

export function convertSubmission(db: DBSubmission): Submission {
	checkAvailable(["submissionid", "courseid", "userid", "title", "date", "state"], db);
	return {
		submissionID: UUIDHelper.fromUUID(db.submissionid),
        courseID: UUIDHelper.fromUUID(db.courseid),
        courseName: db.coursename,
		userID: UUIDHelper.fromUUID(db.userid),
		title: db.title,
		date: db.date,
		state: getEnum(SubmissionStatus, db.state)
	};
}
export function submissionToAPI(db: DBAPISubmission): APISubmission {
	checkAvailable(["submissionid", "courseid", "title", "date", "state"], db);
	
	return {
		ID: UUIDHelper.fromUUID(db.submissionid),
		name: db.title,
		user: userToAPI(db),
		date: db.date.toISOString(),
		state: getEnum(SubmissionStatus, db.state),
		files: [],
		references: {
            courseID: UUIDHelper.fromUUID(db.courseid),
            courseName: db.coursename
		}
	};
}