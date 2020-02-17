const HH = require("./HelperHelper")

import {localRoles} from '../../../enums/localRoleEnum'
import {IPermission} from '../../../models/permission'
/**
 * interface for interacting with rolepermissions
 * @Author Rens Leendertz
 */
const pool = HH.pool

export default class RolePermissionsHelper {
	/**
	 * get all roles currently stored in the database, given to onSuccess as a list of IPermission
	 */
	static getAllRoles(onSuccess : Function, onFailure : Function){
		pool.query("SELECT * FROM \"CourseRolePermissions\"")
		.then((res:{rows:IPermission[]}) => onSuccess(
			res.rows))//.map((x: IPermission) => {role: x.courseRoleID, permission: x.permission})))
		.catch(onFailure)
	}

	/**
	 * get all permissions associated with a role currently stored in the database by name, 
	 * given to onSuccess as an IPermission
	 */
	static getRolePermissions(role : string, onSuccess : Function, onFailure : Function){
		pool.query("SELECT permission FROM \"CourseRolePermissions\" WHERE courseRoleID=$1",[role])
		.then((res : {rows : IPermission[]}) => onSuccess(res.rows[0]))
		.catch(onFailure)
	}

	/**
	 * Add a new role to the database
	 */
	static addNewLocalRole(name : string, permissions : number, onSuccess : Function, onFailure : Function){
		pool.query("INSERT INTO \"CourseRolePermissions\" VALUES ($1,$2)", [name, this.toBin(permissions)])
		.then(onSuccess)
		.catch(onFailure)
	}
	/**
	 * set the the permissions for a role in the database.
	 * all old permissions will NOT be retained.
	 */
	static setPermissionOnRole(name : string, permissions : number, onSuccess : Function, onFailure : Function){
		pool.query("UPDATE \"CourseRolePermissions\" SET permission = $2 WHERE courseRoleID=$1",[name, this.toBin(permissions)])
		.then(onSuccess)
		.catch(onFailure)
	}
	/**
	 * Add some permissions to a role in the database
	 * the @param permission should be constructed using the localPermissions Enum inside enums/localRoleEnum 
	 * If the role already has some of the rights, those will be retained
	 * No permissions will be removed
	 */
	static addPermissionToRole(name : string, permission : number, onSuccess : Function, onFailure : Function){
		pool.query("UPDATE \"CourseRolePermissions\" SET permission=permission | $2 WHERE courseRoleID=$1",[name, this.toBin(permission)])
		.then(onSuccess)
		.catch(onFailure)
	}

	/**
	 * Remove some permissions from a role in the database
	 * the @param permission should be constructed using the localPermissions Enum inside enums/localRoleEnum 
	 * If the role already does not have (some of) the rights, those will not enabled
	 * No permissions will be added
	 */
	static removePermissionFromRole(name : string, permission : number, onSuccess : Function, onFailure : Function){
		pool.query("UPDATE \"CourseRolePermissions\" SET permission=permission & (~($2::bit(40))) WHERE courseRoleID=$1",[name, this.toBin(permission)])
		.then(onSuccess())
		.catch(onFailure)
	}

	/**
	 * Remove a role from the database. 
	 * This may fail due to foreign key constraints if there are still users with this role in a course.
	 * make sure to change those permissions first.
	 */
	static deleteLocalRole(name : string, onSuccess : Function, onFailure : Function) {
		pool.query("DELETE FROM \"CourseRolePermissions\" WHERE courseRoleID=$1",[name])
		.then(onSuccess)
		.catch(onFailure)
	}
	static toBin(n : number | undefined){
		if (n === undefined) return undefined
		return n.toString(2).padStart(40, '0')
	}

}