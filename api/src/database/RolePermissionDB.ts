import {pool, extract, map, one, toBin, pgDB } from "./HelperDB";
import {localRole, checkEnum} from '../../../enums/localRoleEnum'
import {RolePermission, DBRolePermission, convertRolePermission} from '../../../models/database/RolePermission'
/**
 * interface for interacting with rolepermissions
 * @Author Rens Leendertz
 */

export class RolePermissionDB {
	/**
	 * get all roles currently stored in the database, given to onSuccess as a list of Permission
	 */
	static async getAllRoles(DB : pgDB = pool){
		return DB.query(`SELECT * FROM "CourseRolePermissions"`)
		.then(extract).then(map(convertRolePermission))
	}

	/**
	 * get all permissions associated with a role currently stored in the database by name, 
	 * given to onSuccess as an Permission
	 */
	static async getRolePermissions(role : string, DB : pgDB = pool){
		return DB.query(`SELECT * 
			FROM "CourseRolePermissions" 
			WHERE courseRoleID=$1`,[role])
		.then(extract).then(map(convertRolePermission)).then(one)
	}

	/**
	 * Add a new role to the database
	 */
	static async addNewLocalRole(name : string, permissions : number, DB : pgDB = pool){
		return DB.query(`INSERT INTO "CourseRolePermissions" 
			VALUES ($1,$2) 
			RETURNING *`, [name, toBin(permissions)])
		.then(extract).then(map(convertRolePermission)).then(one)
	}
	/**
	 * set the the permissions for a role in the database.
	 * all old permissions will NOT be retained.
	 */
	static async setPermissionOnRole(name : string, permissions : number, DB : pgDB = pool){
		return DB.query(`UPDATE "CourseRolePermissions" 
			SET permission = $2 
			WHERE courseRoleID=$1 
			RETURNING *`,[name, toBin(permissions)])
		.then(extract).then(map(convertRolePermission)).then(one)
	}
	/**
	 * Add some permissions to a role in the database
	 * the @param permission should be constructed using the localPermissions Enum inside enums/localRoleEnum 
	 * If the role already has some of the rights, those will be retained
	 * No permissions will be removed
	 */
	static async addPermissionToRole(name : string, permission : number, DB : pgDB = pool){
		return DB.query(`UPDATE "CourseRolePermissions" 
			SET permission=permission | $2 
			WHERE courseRoleID=$1 
			RETURNING *`,[name, toBin(permission)])
		.then(extract).then(map(convertRolePermission)).then(one)
	}

	/**
	 * Remove some permissions from a role in the database
	 * the @param permission should be constructed using the localPermissions Enum inside enums/localRoleEnum 
	 * If the role already does not have (some of) the rights, those will not enabled
	 * No permissions will be added
	 */
	static async removePermissionFromRole(name : string, permission : number, DB : pgDB = pool){
		return DB.query(`UPDATE "CourseRolePermissions" 
			SET permission=permission & (~($2::bit(40))) 
			WHERE courseRoleID=$1 
			RETURNING *`,[name, toBin(permission)])
		.then(extract).then(map(convertRolePermission)).then(one)
	}

	/**
	 * Remove a role from the database. 
	 * This may fail due to foreign key constraints if there are still users with this role in a course.
	 * make sure to change those permissions first.
	 */
	static async deleteLocalRole(name : string, DB : pgDB = pool) {
		return DB.query(`DELETE FROM "CourseRolePermissions" 
			WHERE courseRoleID=$1 
			RETURNING *`,[name])
		.then(extract).then(map(convertRolePermission)).then(one)
	}
}