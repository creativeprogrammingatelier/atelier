import {UUIDHelper} from "../../api/src/helpers/UUIDHelper";
import {InvalidDatabaseResponseError} from "../../api/src/database/DatabaseErrors";
import {DBTools, checkAvailable, toDec, noNull} from "../../api/src/database/HelperDB";

import {checkEnum, getEnum} from "../../helpers/EnumHelper";

import {Mention as APIMention} from "../api/Mention";
import {User} from "../api/User";
import {CourseRole} from "../enums/CourseRoleEnum";
import {GlobalRole} from "../enums/GlobalRoleEnum";

import {DBAPIComment, commentToAPI} from "./Comment";

export interface Mention extends DBTools {
	mentionID?: string,
	mentionGroup?: CourseRole | null,
	
	userID?: string | null,
	userName?: string | null,
	email?: string | null,
	courseRole?: string | null,
	globalRole?: string | null,
	permission?: number | null,
	
	commentID?: string,
	commentThreadID?: string,
	submissionID?: string,
	courseID?: string,
}

/**
 * m.mentionID, m.userGroup, cv.commentID, cv.fileID, cv.commentThreadID,
 * cv.snippetID, cv.submissionID, cv.courseID, cv.created, cv.edited,
 * cv.body cu.userID, cu.userName, cu.email, cu.globalRole,
 * cu.courseRole, cu.permission, cmu.userID as cmuUserID,
 * cmu.userName as cmuUserName, cmu.email as cmuEmail,
 * cmu.globalRole as cmuGlobalRole, cmu.courseRole as cmuCourseRole,
 * cmu.permission as cmuPermission, subm.title as submTitle
 */
export interface DBMention {
	mentionid: string,
	usergroup: string | undefined,
	
	commentid: string,
	commentthreadid: string,
	submissionid: string,
	courseid: string,
	fileid: string,
	snippetid: string,
	created: Date,
	edited: Date,
    body: string,
    visibilitystate: string,
    automated: boolean,
    submissionname: string,
    submissionuserid: string,
    submissionusername: string,
	linestart: number,
	type: string,
	
	userid: string | undefined,
	username: string | undefined,
	email: string | undefined,
	globalrole: string | undefined,
	courserole: string | undefined,
	permission: string | undefined,
	
	cmuuserid: string,
	cmuusername: string,
	cmuemail: string,
	cmuglobalrole: string,
	cmupermission: string,
	
	submtitle: string,
	coursename: string
}

export function convertMention(db: DBMention): Mention {
	//can be null or undefined, this is way more readable
	// tslint:disable-next-line: triple-equals
	if ((db.usergroup == undefined) === (db.userid == undefined)) {
		throw new InvalidDatabaseResponseError("a mention should have either a user, or a group as target.");
	}
	return {
		mentionID: UUIDHelper.fromUUID(db.mentionid),
		mentionGroup: db.usergroup == null ? undefined : getEnum(CourseRole, db.usergroup),
		userID: UUIDHelper.fromUUID(db.userid),
		commentID: UUIDHelper.fromUUID(db.commentid)
	};
}
export function mentionToAPI(db: DBMention): APIMention {
	checkAvailable(["mentionid", "usergroup", //mention specific
		"commentid", "fileid", "commentthreadid", "snippetid", //comment specific
		"submissionid", "courseid", "created", "edited",
		"body", "type", "linestart",
		"userid", "username", "email", "globalrole", "courserole", "permission", //mentioned user
		"cmuuserid", "cmuusername", "cmuemail", "cmuglobalrole", "cmupermission", //comment creator
		"submtitle",
		"coursename"
	], db);
	/*m.mentionID, m.userGroup,
	 cv.commentID, cv.fileID, cv.commentThreadID, cv.snippetID,
	 cv.submissionID, cv.courseID, cv.created, cv.edited,
	 cv.body, cv.type, cv.lineStart,
	 cu.userID, cu.userName, cu.email, cu.globalRole,
	 cu.courseRole, cu.permission,
	 cmu.userID as cmuUserID,
	 cmu.userName as cmuUserName, cmu.email as cmuEmail,
	 cmu.globalRole as cmuGlobalRole,
	 cmu.permission as cmuPermission,
	 subm.title as submTitle,
	 c.courseName
	 */
	//can be null or undefined, this is way more readable
	// tslint:disable-next-line: triple-equals
	if ((db.usergroup == undefined) === (db.userid == undefined)) {
		throw new InvalidDatabaseResponseError("a mention should have either a user, or a group as target.");
	}
	const isUser = db.userid !== undefined && db.userid !== null;
	if (!isUser) {
		checkEnum(CourseRole, db.usergroup!);
	}
	let user: User | undefined = undefined;
	if (isUser) {
		user = {
			ID: UUIDHelper.fromUUID(db.userid!),
			name: noNull(db.username),
			email: noNull(db.email),
			permission: {
				globalRole: getEnum(GlobalRole, noNull(db.globalrole)),
				courseRole: getEnum(CourseRole, noNull(db.courserole)),
				permissions: toDec(noNull(db.permission))
			}
		};
	}
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
        fileid: db.fileid,
        visibilitystate: db.visibilitystate,
        automated: db.automated,
        submissionname: db.submissionname,
        submissionuserid: db.submissionuserid,
        submissionusername: db.submissionusername,
		snippetid: db.snippetid,
		type: db.type,
		linestart: db.linestart
	};
	const comment = commentToAPI(dbcommentObject);
	return {
		ID: UUIDHelper.fromUUID(db.mentionid),
		mentionGroup: db.usergroup,
		user,
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