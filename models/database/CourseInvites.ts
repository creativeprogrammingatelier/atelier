import { localRole, checkEnum } from "../../enums/localRoleEnum";
import { DatabaseError } from "../../api/src/database/DatabaseErrors";
import { UUIDHelper } from "../../api/src/helpers/UUIDHelper";
import { DBTools } from "../../api/src/database/HelperDB";

export interface CourseInvite extends DBTools{
	inviteID? : string,
	creatorID? : string,
	courseID? : string,
	type? : string,
	joinRole? : localRole,
}
export interface DBCourseInvite {
	inviteid : string,
	creatorid : string,
	courseid : string,
	type : string,
	joinrole : localRole,
}

export function convertCourseInvite(db : DBCourseInvite) : CourseInvite {
	if (!(checkEnum(db.joinrole))){
		throw new DatabaseError('database gave a course role which was not recognised by the backend')
	}
	return {
		inviteID: UUIDHelper.fromUUID(db.inviteid),
		creatorID: UUIDHelper.fromUUID(db.creatorid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		type: db.type,
		joinRole: localRole[db.joinrole]
	}
}