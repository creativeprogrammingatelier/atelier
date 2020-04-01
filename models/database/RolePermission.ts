import {CourseRole} from '../enums/CourseRoleEnum'
import {CoursePermission as APICoursePermission} from '../api/Permission'
import { pgDB, DBTools, checkAvailable, toDec } from '../../api/src/database/HelperDB'
import { getEnum } from '../enums/enumHelper'
import { GlobalRole } from '../enums/GlobalRoleEnum'
export type CoursePermission = Partial<APICoursePermission>

export {APICoursePermission}

export interface DBRolePermission extends DBTools {
	courseroleid : string,
	permission : string
}
export type DBAPIRolePermission = DBRolePermission


export function convertRolePermission(db : DBRolePermission) : CoursePermission {
	checkAvailable(["courseroleid", "permission"], db)
	return {
		courseRole: getEnum(CourseRole, db.courseroleid),
		permissions: toDec(db.permission)
	}
}
export function rolePermToAPI(db : DBAPIRolePermission) : CoursePermission {
	return convertRolePermission(db)
}
