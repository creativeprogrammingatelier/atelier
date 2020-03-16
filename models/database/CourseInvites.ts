import { courseRole} from "../enums/courseRoleEnum";
import { DatabaseError } from "../../api/src/database/DatabaseErrors";
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper";
import { DBTools, checkAvailable } from "../../api/src/database/HelperDB";
import { getEnum } from "../enums/enumHelper";

export interface CourseInvite extends DBTools{
	inviteID? : string,
	creatorID? : string,
	courseID? : string,
	type? : string,
	joinRole? : courseRole,
}
export interface DBCourseInvite {
	inviteid : string,
	creatorid : string,
	courseid : string,
	type : string,
	joinrole : courseRole,
}

export function convertCourseInvite(db : DBCourseInvite) : CourseInvite {
	checkAvailable(["inviteid", "creatorid", "courseid", "type", "joinrole"],db)
	return {
		inviteID: UUIDHelper.fromUUID(db.inviteid),
		creatorID: UUIDHelper.fromUUID(db.creatorid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		type: db.type,
		joinRole: getEnum(courseRole, db.joinrole)
	}
}