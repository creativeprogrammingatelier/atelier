import {courseRole} from '../enums/courseRoleEnum'
import {Permission as APIPermission} from '../api/Permission'
import { pgDB, DBTools, checkAvailable } from '../../api/src/database/HelperDB'
import { getEnum } from '../enums/enumHelper'
export interface RolePermission{
	role?:courseRole,
	permission : number
}

export {APIPermission}

export interface DBRolePermission extends DBTools {
	courseroleid : string,
	permission : number | string
}
export type DBAPIRolePermission = DBRolePermission

export function convertRolePermission(db : DBRolePermission) : RolePermission {
	checkAvailable(["courseroleid", "permission"], db)
	return {
		role: getEnum(courseRole, db.courseroleid),
		//shhh: this actually comes back as a string, don't tell anyone
		// tslint:disable-next-line: ban
		permission: typeof db.permission === 'string' ? parseInt(db.permission, 2) : db.permission
	}
}
export function rolePermToAPI(db : DBAPIRolePermission) : APIPermission {
	checkAvailable(["courseroleid", "permission"], db)
	return {
		role: getEnum(courseRole, db.courseroleid),
		//shhh: this actually comes back as a string, don't tell anyone
		// tslint:disable-next-line: ban
		permissions: typeof db.permission === 'string' ? parseInt(db.permission, 2) : db.permission
	}
}
