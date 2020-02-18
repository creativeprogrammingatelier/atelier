import {submissionStatus} from '../enums/submissionStatusEnum'

export interface Submission {
	submissionid?: string;
	userid?: string;
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
