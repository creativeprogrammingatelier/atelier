import { UUIDHelper } from "../../api/src/helpers/UUIDHelper"
import { Comment as APIComment } from "../api/Comment"
import { DBAPIUser, userToAPI } from "./User"
export interface Comment {
    commentID?: string,
    commentThreadID?: string, 
    userID?: string,
    date?: Date,
    body?: string
}

export interface DBComment {
    commentid: string,
    commentthreadid: string, 
    userid: string,
    date: Date,
    body: string
}
export interface DBAPIComment extends DBComment, DBAPIUser {
	submissionid: string,
	courseid: string
}

export function convertComment(db : DBComment) : Comment {
	return {
		commentID: UUIDHelper.fromUUID(db.commentid),
		commentThreadID: UUIDHelper.fromUUID(db.commentthreadid),
		userID: UUIDHelper.fromUUID(db.userid),
		date: db.date,
		body: db.body
	}
}
export function commentToAPI(db : DBAPIComment) : APIComment {
	return {
		ID: UUIDHelper.fromUUID(db.commentid),
		user: userToAPI(db),
		text:db.body,
		date:db.date.toLocaleString(),
		references: {
			courseID: UUIDHelper.fromUUID(db.courseid),
			submissionID: UUIDHelper.fromUUID(db.submissionid),
			commentThreadID: UUIDHelper.fromUUID(db.commentthreadid)
		}
	}
}
export function onlyComment(obj : Comment){
    return {
		commentID: obj.commentID,
		commentThreadID: obj.commentThreadID,
		userID: obj.userID,
		date: obj.date,
		body: obj.body
	}
}