import { DBTools } from "../../api/src/database/HelperDB";
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper";
import { Mention as APIMention } from "../api/Mention";

export interface Mention extends DBTools {
	mentionID? : string,
	userID? : string,
	commentID? : string,
	commentThreadID? : string,
	submissionID? : string,
	courseID? : string,
}
export interface DBMention {
	mentionid : string,
	userid : string,
	commentid: string,
	commentthreadid : string,
	submissionid : string,
	courseid : string,
}

export function convertMention(db : DBMention) : Mention{
	return {
		mentionID: UUIDHelper.fromUUID(db.mentionid),
		userID: UUIDHelper.fromUUID(db.userid),
		commentID: UUIDHelper.fromUUID(db.commentid),
	}
}
export function mentionToAPI(db : DBMention) : APIMention{
	return {
		mentionID: UUIDHelper.fromUUID(db.mentionid),
		userID: UUIDHelper.fromUUID(db.userid),
		commentID: UUIDHelper.fromUUID(db.commentid),
		references:{
			commentThreadID: UUIDHelper.fromUUID(db.commentthreadid),
			submissionID: UUIDHelper.fromUUID(db.submissionid),
			courseID: UUIDHelper.fromUUID(db.courseid),
		}
	}
}