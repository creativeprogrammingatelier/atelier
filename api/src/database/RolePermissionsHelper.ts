const HH = require("./HelperHelper")

import {localRole, checkEnum} from '../../../enums/localRoleEnum'
import {RolePermission, DBRolePermission, convert} from '../../../models/RolePermission'
/**
 * interface for interacting with rolepermissions
 * @Author Rens Leendertz
 */
const {pool, extract, map, one} = HH

export default class RolePermissionsHelper {
	/**
	 * get all roles currently stored in the database, given to onSuccess as a list of Permission
	 */
	static getAllRoles(){
		return pool.query("SELECT * FROM \"CourseRolePermissions\"")
		.then(extract).then(map(convert))
	}

	/**
	 * get all permissions associated with a role currently stored in the database by name, 
	 * given to onSuccess as an Permission
	 */
	static getRolePermissions(role : string){
		return pool.query("SELECT * FROM \"CourseRolePermissions\" WHERE courseRoleID=$1",[role])
		.then(extract).then(map(convert)).then(one)
	}

	/**
	 * Add a new role to the database
	 */
	static addNewLocalRole(name : string, permissions : number){
		return pool.query("INSERT INTO \"CourseRolePermissions\" VALUES ($1,$2) RETURNING *", [name, RolePermissionsHelper.toBin(permissions)])
		.then(extract).then(map(convert)).then(one)
	}
	/**
	 * set the the permissions for a role in the database.
	 * all old permissions will NOT be retained.
	 */
	static setPermissionOnRole(name : string, permissions : number){
		return pool.query("UPDATE \"CourseRolePermissions\" SET permission = $2 WHERE courseRoleID=$1 RETURNING *",[name, RolePermissionsHelper.toBin(permissions)])
		.then(extract).then(map(convert)).then(one)
	}
	/**
	 * Add some permissions to a role in the database
	 * the @param permission should be constructed using the localPermissions Enum inside enums/localRoleEnum 
	 * If the role already has some of the rights, those will be retained
	 * No permissions will be removed
	 */
	static addPermissionToRole(name : string, permission : number){
		return pool.query("UPDATE \"CourseRolePermissions\" SET permission=permission | $2 WHERE courseRoleID=$1 RETURNING *",[name, RolePermissionsHelper.toBin(permission)])
		.then(extract).then(map(convert)).then(one)
	}

	/**
	 * Remove some permissions from a role in the database
	 * the @param permission should be constructed using the localPermissions Enum inside enums/localRoleEnum 
	 * If the role already does not have (some of) the rights, those will not enabled
	 * No permissions will be added
	 */
	static removePermissionFromRole(name : string, permission : number){
		return pool.query("UPDATE \"CourseRolePermissions\" SET permission=permission & (~($2::bit(40))) WHERE courseRoleID=$1 RETURNING *",[name, RolePermissionsHelper.toBin(permission)])
		.then(extract).then(map(convert)).then(one)
	}

	/**
	 * Remove a role from the database. 
	 * This may fail due to foreign key constraints if there are still users with this role in a course.
	 * make sure to change those permissions first.
	 */
	static deleteLocalRole(name : string) {
		return pool.query("DELETE FROM \"CourseRolePermissions\" WHERE courseRoleID=$1 RETURNING *",[name])
		.then(extract).then(map(convert)).then(one)
	}
	static toBin(n : number | undefined){
		if (n === undefined) return undefined
		return n.toString(2).padStart(40, '0')
	}

}