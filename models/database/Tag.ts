import {UUIDHelper} from "../../api/src/helpers/UUIDHelper";
import {DBTools, checkAvailable} from "../../api/src/database/HelperDB";

import {Tag as APITag} from "../api/Tag";

import {DBAPIComment, commentToAPI} from "./Comment";

export interface Tag extends DBTools {
	tagID?: string,
	tagbody?: string,
	
	commentID?: string,
	commentThreadID?: string,
	submissionID?: string,
	courseID?: string
}

export interface DBTag {
	tagid: string,
	tagbody: string,
	
	commentid: string,
	commentthreadid: string,
	submissionid: string,
	courseid: string,
	fileid: string,
	snippetid: string,
	created: Date,
    edited: Date,
    visibilitystate: string,
    automated: boolean,
    submissionname: string,
    submissionuserid: string,
    submissionusername: string,
	body: string,
	linestart: number,
	type: string,

	cmuuserid: string,
	cmuusername: string,
	cmuemail: string,
	cmuglobalrole: string,
	cmupermission: string,

	submtitle: string,
	coursename: string
}

export function convertTag(db: DBTag): Tag {
	//can be null or undefined, this is way more readable
	// tslint:disable-next-line: triple-equals
	return {
		tagID: UUIDHelper.fromUUID(db.tagid),
		commentID: UUIDHelper.fromUUID(db.commentid)
	};
}
export function tagToAPI(db: DBTag): APITag {
	checkAvailable(["tagid","tagbody",
		"commentid", "fileid", "commentthreadid", "snippetid", //comment specific
		"submissionid", "courseid", "created", "edited",
		"body", "type", "linestart",
		"cmuuserid", "cmuusername", "cmuemail", "cmuglobalrole", "cmupermission", //comment creator
		"submtitle",
		"coursename"
	], db);

	const dbcommentObject: DBAPIComment = {
		commentid: db.commentid,
		userid: db.cmuuserid,
		username: db.cmuusername,
		email: db.cmuemail,
		globalrole: db.cmuglobalrole,
		permission: db.cmupermission,
		body: db.body,
		created: db.created,
		edited: db.edited,
		courseid: db.courseid,
		submissionid: db.submissionid,
        commentthreadid: db.commentthreadid,
        visibilitystate: db.visibilitystate,
        submissionname: db.submissionname,
        submissionuserid: db.submissionuserid,
        submissionusername: db.submissionusername,
        automated: db.automated,
		fileid: db.fileid,
		snippetid: db.snippetid,
		type: db.type,
		linestart: db.linestart
	};
	const comment = commentToAPI(dbcommentObject);
	return {
		ID: UUIDHelper.fromUUID(db.tagid),
		tagBody: db.tagbody,
		comment,
		submissionTitle: db.submtitle,
		courseName: db.coursename,
		references: {
			commentThreadID: UUIDHelper.fromUUID(db.commentthreadid),
			submissionID: UUIDHelper.fromUUID(db.submissionid),
			courseID: UUIDHelper.fromUUID(db.courseid)
		}
	}
}