import {localRole, checkEnum} from '../enums/localRoleEnum'

export interface RolePermission{
	role?:localRole,
	permission : number
}


export interface DBRolePermission {
	courseroleid : string,
	permission : number
}
export function convert(db : DBRolePermission) : RolePermission {
	if (!checkEnum(db.courseroleid)){
		throw new Error("role stored in database does not match enum on server: "+ db.courseroleid)
	}
	return {
		role: localRole[db.courseroleid],
		permission: db.permission
	}
}
