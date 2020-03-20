import { DBTools, checkAvailable, toDec, noNull } from "../../api/src/database/HelperDB";
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper";
import { Mention as APIMention } from "../api/Mention";
import { courseRole } from "../enums/courseRoleEnum";
import { checkEnum, getEnum } from "../enums/enumHelper";
import { InvalidDatabaseResponseError } from "../../api/src/database/DatabaseErrors";
import { userToAPI, DBUser } from "./User";
import { User } from "../api/User";
import { globalRole } from "../enums/globalRoleEnum";


export interface Mention extends DBTools {
	mentionID? : string,
	mentionGroup?: courseRole | null,
	
	userID? : string | null,
	userName? : string | null,
	email? : string | null,
	courseRole? : string | null,
	globalRole? : string | null,
	permission? : number | null,


	commentID? : string,
	commentThreadID? : string,
	submissionID? : string,
	courseID? : string,
}
/**
 * m.mentionID, m.userGroup, cv.commentID, cv.commentThreadID, 
 * cv.submissionID, cv.courseID, cu.userID, cu.userName, 
 * cu.email, cu.globalRole, cu.courseRole, cu.permission
 */
export interface DBMention {
	mentionid : string,
	usergroup : string | undefined,
	
	commentid: string,
	commentthreadid : string,
	submissionid : string,
	courseid : string,

	userid : string | undefined,
	userName : string | undefined,
	email : string | undefined,
	globalRole : string | undefined,
	courseRole : string | undefined,
	permission : string | undefined,

}

export function convertMention(db : DBMention) : Mention{
	//can be null or undefined, this is way more readable
	// tslint:disable-next-line: triple-equals
	if ((db.usergroup == undefined) === (db.userid == undefined)){
		throw new InvalidDatabaseResponseError('a mention should have either a user, or a group as target.')
	}
	return {
		mentionID: UUIDHelper.fromUUID(db.mentionid),
		mentionGroup: db.usergroup == null? undefined : getEnum(courseRole, db.usergroup),
		userID: UUIDHelper.fromUUID(db.userid),
		commentID: UUIDHelper.fromUUID(db.commentid),
	}
}
export function mentionToAPI(db : DBMention) : APIMention{
	checkAvailable(["mentionid","usergroup","userid","commentid","commentthreadid","submissionid","courseid"],db)

	//can be null or undefined, this is way more readable
	// tslint:disable-next-line: triple-equals
	if ((db.usergroup == undefined) === (db.userid == undefined)){
		throw new InvalidDatabaseResponseError('a mention should have either a user, or a group as target.')
	}
	const isUser = db.userid === undefined || db.userid === null
	if (!isUser) checkEnum(courseRole, db.usergroup!)
	let user : User | undefined = undefined;
	if (isUser){
		user = {
			ID: UUIDHelper.fromUUID(db.userid!),
			name: noNull(db.userName),
			email: noNull(db.email),
			permission: {
				globalRole: getEnum(globalRole, noNull(db.globalRole)),
				courseRole: getEnum(globalRole, noNull(db.courseRole)),
				permissions: toDec(noNull(db.permission)),
			}
		}
	}
	return {
		mentionID: UUIDHelper.fromUUID(db.mentionid),
		mentionGroup: db.usergroup,
		user,
		commentID: UUIDHelper.fromUUID(db.commentid),
		references:{
			commentThreadID: UUIDHelper.fromUUID(db.commentthreadid),
			submissionID: UUIDHelper.fromUUID(db.submissionid),
			courseID: UUIDHelper.fromUUID(db.courseid),
		}
	}
}