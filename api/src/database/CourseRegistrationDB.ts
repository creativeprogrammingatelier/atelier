import {query, extract, map, one} from "./HelperDB";

import {CourseRegistration, convertCourseReg} from '../../../models/CourseRegistration';
import {RolePermissionDB} from './RolePermissionDB'
/**
 * courseID, userID, role, permission
 * @Author Rens Leendertz
 */

 export class CourseRegistrationDB {

	static toBin = RolePermissionDB.toBin;

	/**
	 * return all entries in this table, with permissions set correctly
	 */
	 static getAllEntries() {
		return query(`SELECT 
				userID, 
				courseID, 
				courseRole, 
				permission |(SELECT permission 
							 FROM "CourseRolePermissions" 
							 WHERE courseRoleID=courseRole
							) AS permission
			FROM "CourseRegistration"`)
		.then(extract).then(map(convertCourseReg))
		
	}

	/**
	 * get all users entered in a specific course. permissions set correctly
	 */
	static getEntriesByCourse(courseID : string) {
		return query(`SELECT 
				userID, 
				courseID, 
				courseRole, 
				permission |(SELECT permission 
							 FROM "CourseRolePermissions" 
							 WHERE courseRoleID=courseRole
							) AS permission
			FROM "CourseRegistration"
			WHERE courseID=$1`, [courseID])
		.then(extract).then(map(convertCourseReg))
	}

	/**
	 * get all courses a user is entered into. permissions set correctly
	 */
	static getEntriesByUser(userID : string) {
		return query(`SELECT 
				userID, 
				courseID, 
				courseRole, 
				permission |(SELECT permission 
							 FROM "CourseRolePermissions" 
							 WHERE courseRoleID=courseRole
							) AS permission
			FROM "CourseRegistration" 
			WHERE userID=$1`, [userID])
		.then(extract).then(map(convertCourseReg))
		
	}

	/**
	 * add a new entry, all is required but permission. This defaults to no elevated permissions.
	 */
	static addEntry(entry : CourseRegistration){
		const {
			courseID,
			userID,
			role,
			permission = 0
		} = entry;
		return query(`INSERT INTO \"CourseRegistration\" 
			VALUES ($1,$2,$3,$4) 
			RETURNING *`, [courseID, userID, role, CourseRegistrationDB.toBin(permission)])
		.then(extract).then(map(convertCourseReg)).then(one)
	}

	/**
	 * update the role of a user. 
	 *
	 * permission field will be ignored
	 */
	static updateRole(entry : CourseRegistration){
		const {
			courseID,
			userID,
			role
		} = entry;
		return query(`UPDATE \"CourseRegistration\" SET 
			courseRole=COALESCE($3, courseRole)
			WHERE courseID=$1 AND userID=$2
			RETURNING *
			`, [courseID, userID, role])
		.then(extract).then(map(convertCourseReg)).then(one)
	}

	/**
	 * allow an entry in the database some extra permissions.
	 * The given field will be unioned with the current state.
	 * the role field will be ignored, others are mandatory.
	 */
	static addPermission(entry : CourseRegistration){
		const {
			courseID,
			userID,
			permission
		} = entry;
		return query(`UPDATE \"CourseRegistration\" SET 
			permission=permission | $3
			WHERE courseID=$1 AND userID=$2
			RETURNING *
			`, [courseID, userID, CourseRegistrationDB.toBin(permission)])
		.then(extract).then(map(convertCourseReg)).then(one)
	}

	/**
	 * revoke some permissions from an entry in the database.
	 * The set permissions will be removed if set in the current state.
	 * A user will keep the permissions associated with its role. these cannot be removed.
	 * the role field will be ignored, others are mandatory.
	 */
	static removePermission(entry : CourseRegistration){
		const {
			courseID,
			userID,
			permission
		} = entry;
		return query(`UPDATE \"CourseRegistration\" SET 
			permission=permission & ~($3::bit(40))
			WHERE courseID=$1 AND userID=$2
			RETURNING *
			`, [courseID, userID, CourseRegistrationDB.toBin(permission)])
		.then(extract).then(map(convertCourseReg)).then(one)
	}

	/**
	 * remove a user from a course. 
	 * permission and role will be ignored.
	 */
	static deleteEntry(entry : CourseRegistration){
		const {
			courseID,
			userID
		} = entry;
		return query("DELETE FROM \"CourseRegistration\" WHERE courseID=$1 AND userID=$2 RETURNING *", [courseID, userID])
		.then(extract).then(map(convertCourseReg)).then(one)
	}
}