import {pool, extract, map, one, toBin, pgDB, checkAvailable } from "./HelperDB";

import {CourseRegistration, convertCourseReg} from '../../../models/database/CourseRegistration';
import {RolePermissionDB} from './RolePermissionDB'
import { UUIDHelper, ID64 } from "../helpers/UUIDHelper";
/**
 * courseID, userID, role, permission
 * @Author Rens Leendertz
 */

 export class CourseRegistrationDB {

	/**
	 * return all entries in this table, with permissions set correctly
	 */
	 static async getAllEntries(DB : pgDB = pool) {
		return DB.query(`SELECT 
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
	static async getEntriesByCourse(courseID : ID64, DB : pgDB = pool) {
		const courseid = UUIDHelper.toUUID(courseID);
		return DB.query(`SELECT 
				userID, 
				courseID, 
				courseRole, 
				permission |(SELECT permission 
							 FROM "CourseRolePermissions" 
							 WHERE courseRoleID=courseRole
							) AS permission
			FROM "CourseRegistration"
			WHERE courseID=$1`, [courseid])
		.then(extract).then(map(convertCourseReg))
	}

	/**
	 * get all courses a user is entered into. permissions set correctly
	 */
	static async getEntriesByUser(userID : ID64, DB : pgDB = pool) {
		const userid = UUIDHelper.toUUID(userID);
		return DB.query(`SELECT 
				userID, 
				courseID, 
				courseRole, 
				permission |(SELECT permission 
							 FROM "CourseRolePermissions" 
							 WHERE courseRoleID=courseRole
							) AS permission
			FROM "CourseRegistration" 
			WHERE userID=$1`, [userid])
		.then(extract).then(map(convertCourseReg))
		
	}

	/**
	 * add a new entry, all is required but permission. This defaults to no elevated permissions.
	 */
	static async addEntry(entry : CourseRegistration, DB : pgDB = pool){
		checkAvailable(['courseID','userID','role'], entry);
		const {
			courseID,
			userID,
			role,
			permission = 0
		} = entry;
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID),
			perm = toBin(permission)
		return DB.query(`INSERT INTO "CourseRegistration" 
			VALUES ($1,$2,$3,$4) 
			RETURNING *`, [courseid, userid, role, perm])
		.then(extract).then(map(convertCourseReg)).then(one)
	}

	/**
	 * update the role of a user. 
	 *
	 * permission field will be ignored
	 */
	static async updateRole(entry : CourseRegistration, DB : pgDB = pool){
		checkAvailable(['courseID','userID','role'], entry)
		const {
			courseID,
			userID,
			role
		} = entry;
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID);
		return DB.query(`UPDATE "CourseRegistration" SET 
			courseRole=COALESCE($3, courseRole)
			WHERE courseID=$1 AND userID=$2
			RETURNING *`, [courseid, userid, role])
		.then(extract).then(map(convertCourseReg)).then(one)
	}

	/**
	 * allow an entry in the database some extra permissions.
	 * The given field will be unioned with the current state.
	 * the role field will be ignored, others are mandatory.
	 */
	static async addPermission(entry : CourseRegistration, DB : pgDB = pool){
		checkAvailable(['courseID','userID','permission'], entry)
		const {
			courseID,
			userID,
			permission
		} = entry;
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID),
			perm = toBin(permission);
		return DB.query(`UPDATE "CourseRegistration" SET 
			permission=permission | $3
			WHERE courseID=$1 AND userID=$2
			RETURNING *`, [courseid, userid, perm])
		.then(extract).then(map(convertCourseReg)).then(one)
	}

	/**
	 * revoke some permissions from an entry in the database.
	 * The set permissions will be removed if set in the current state.
	 * A user will keep the permissions associated with its role. these cannot be removed.
	 * the role field will be ignored, others are mandatory.
	 */
	static async removePermission(entry : CourseRegistration, DB : pgDB = pool){
		checkAvailable(['courseID','userID','permission'], entry)
		const {
			courseID,
			userID,
			permission
		} = entry;
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID),
			perm = toBin(permission);
		return DB.query(`UPDATE "CourseRegistration" SET 
			permission=permission & ~($3::bit(40))
			WHERE courseID=$1 AND userID=$2
			RETURNING *`, [courseid, userid, perm])
		.then(extract).then(map(convertCourseReg)).then(one)
	}

	/**
	 * remove a user from a course. 
	 * permission and role will be ignored.
	 */
	static async deleteEntry(entry : CourseRegistration, DB : pgDB = pool){
		checkAvailable(['courseID','userID'], entry)
		const {
			courseID,
			userID
		} = entry;
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID)
		return DB.query(`DELETE FROM "CourseRegistration" 
			WHERE courseID=$1 AND userID=$2 
			RETURNING *`, [courseid, userid])
		.then(extract).then(map(convertCourseReg)).then(one)
	}
}