import { CourseRole} from "../enums/CourseRoleEnum";
import { DatabaseError } from "../../api/src/database/DatabaseErrors";
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper";
import { CourseInvite as Invite } from "../api/Invite";
import { DBTools, checkAvailable } from "../../api/src/database/HelperDB";
import {checkEnum, getEnum} from "../enums/EnumHelper";

export interface CourseInvite extends DBTools{
	inviteID? : string,
	creatorID? : string,
	courseID? : string,
	type? : string,
	joinRole? : CourseRole,
}
export interface DBCourseInvite {
	inviteid : string,
	creatorid : string,
	courseid : string,
	type : string,
	joinrole : CourseRole,
}

export function convertCourseInvite(db : DBCourseInvite) : Invite {
	if (!(checkEnum(CourseRole, db.joinrole))){
		throw new DatabaseError('database gave a course role which was not recognised by the backend')
	}
	checkAvailable(["inviteid", "creatorid", "courseid", "type", "joinrole"],db);
	return {
		inviteID: UUIDHelper.fromUUID(db.inviteid),
		creatorID: UUIDHelper.fromUUID(db.creatorid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		type: db.type,
		joinRole: getEnum(CourseRole, db.joinrole)
	}
}