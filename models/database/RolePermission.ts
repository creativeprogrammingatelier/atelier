import {localRole, checkEnum} from '../../enums/localRoleEnum'
import {Permission as APIPermission} from '../api/Permission'
export interface RolePermission{
	role?:localRole,
	permission : number
}

export {APIPermission}

export interface DBRolePermission {
	courseroleid : string,
	permission : number
}
export type DBAPIRolePermission = DBRolePermission

export function convertRolePermission(db : DBRolePermission) : RolePermission {
	if (!checkEnum(db.courseroleid)){
		throw new Error("role stored in database does not match enum on server: "+ db.courseroleid)
	}
	return {
		role: localRole[db.courseroleid],
		permission: db.permission
	}
}
export function rolePermToAPI(db : DBAPIRolePermission) : APIPermission {
	if (!checkEnum(db.courseroleid)){
		throw new Error("role stored in database does not match enum on server: "+ db.courseroleid)
	}
	return {
		role: db.courseroleid,
		permissions: db.permission
	}
}
