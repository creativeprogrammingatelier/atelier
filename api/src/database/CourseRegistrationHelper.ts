const HH = require("./HelperHelper")

import {CourseRegistration, DBCourseRegistration} from '../../../models/CourseRegistration';
import {localRoles} from '../../../enums/localRoleEnum'
import RolePermissionHelper from './RolePermissionsHelper'
/**
 * courseID, userID, role, permission
 * @Author Rens Leendertz
 */
const pool = HH.pool
export default class CourseRegistrationHelper {

	static toBin = RolePermissionHelper.toBin

	/**
	 * return all entries in this table, with permissions set correctly
	 */
	static getAllEntries(onSuccess : Function, onFailure : Function) {
		pool.query(`SELECT 
				userID, 
				courseID, 
				courseRole, 
				permission |(SELECT permission 
							 FROM "CourseRolePermissions" 
							 WHERE courseRoleID=courseRole
							) AS permission
			FROM "CourseRegistration"`)
		.then((res : {rows:DBCourseRegistration[]}) => onSuccess(res.rows.map(this.DBToI)))
		.catch(onFailure)
	}

	/**
	 * get all users entered in a specific course. permissions set correctly
	 */
	static getEntriesByCourse(courseID : string, onSuccess : Function, onFailure : Function) {
		pool.query(`SELECT 
				userID, 
				courseID, 
				courseRole, 
				permission |(SELECT permission 
							 FROM "CourseRolePermissions" 
							 WHERE courseRoleID=courseRole
							) AS permission
			FROM "CourseRegistration"
			WHERE courseID=$1`, [courseID])
		.then((res : {rows:DBCourseRegistration[]}) => onSuccess(res.rows.map(this.DBToI)))
		.catch(onFailure)
	}

	/**
	 * get all courses a user is entered into. permissions set correctly
	 */
	static getEntriesByUser(userID : string, onSuccess : Function, onFailure : Function) {
		pool.query(`SELECT 
				userID, 
				courseID, 
				courseRole, 
				permission |(SELECT permission 
							 FROM "CourseRolePermissions" 
							 WHERE courseRoleID=courseRole
							) AS permission
			FROM "CourseRegistration" 
			WHERE userID=$1`, [userID])
		.then((res : {rows:DBCourseRegistration[]}) => onSuccess(res.rows.map(this.DBToI)))
		.catch(onFailure)
	}

	/**
	 * add a new entry, all is required but permission. This defaults to no elevated permissions.
	 */
	static addEntry(entry : CourseRegistration, onSuccess : Function, onFailure : Function){
		const {
			courseid,
			userid,
			role,
			permission = 0
		} = entry
		pool.query(`INSERT INTO \"CourseRegistration\" 
			VALUES ($1,$2,$3,$4) 
			RETURNING *`, [courseid, userid, role, this.toBin(permission)])
		.then((res : {rows:DBCourseRegistration[]}) => onSuccess(this.DBToI(res.rows[0])))
		.catch(onFailure)
	}

	/**
	 * update the role of a user. 
	 *
	 * permission field will be ignored
	 */
	static updateRole(entry : CourseRegistration, onSuccess : Function, onFailure : Function){
		const {
			courseid,
			userid,
			role
		} = entry
		pool.query(`UPDATE \"CourseRegistration\" SET 
			courseRole=COALESCE($3, courseRole)
			WHERE courseID=$1 AND userID=$2
			RETURNING *
			`, [courseid, userid, role])
		.then((res : {rows:DBCourseRegistration[]}) => onSuccess(this.DBToI(res.rows[0])))
		.catch(onFailure)
	}

	/**
	 * allow an entry in the database some extra permissions.
	 * The given field will be unioned with the current state.
	 * the role field will be ignored, others are mandatory.
	 */
	static addPermission(entry : CourseRegistration, onSuccess : Function, onFailure : Function){
		const {
			courseid,
			userid,
			permission
		} = entry
		pool.query(`UPDATE \"CourseRegistration\" SET 
			permission=permission | $3
			WHERE courseID=$1 AND userID=$2
			RETURNING *
			`, [courseid, userid, this.toBin(permission)])
		.then((res : {rows:DBCourseRegistration[]}) => onSuccess(this.DBToI(res.rows[0])))
		.catch(onFailure)
	}

	/**
	 * revoke some permissions from an entry in the database.
	 * The set permissions will be removed if set in the current state.
	 * A user will keep the permissions associated with its role. these cannot be removed.
	 * the role field will be ignored, others are mandatory.
	 */
	static removePermission(entry : CourseRegistration, onSuccess : Function, onFailure : Function){
		const {
			courseid,
			userid,
			permission
		} = entry
		pool.query(`UPDATE \"CourseRegistration\" SET 
			permission=permission & ~($3::bit(40))
			WHERE courseID=$1 AND userID=$2
			RETURNING *
			`, [courseid, userid, this.toBin(permission)])
		.then((res : {rows:DBCourseRegistration[]}) => onSuccess(res.rows[0]))
		.catch(onFailure)
	}

	/**
	 * remove a user from a course. 
	 * permission and role will be ignored.
	 */
	static deleteEntry(entry : CourseRegistration, onSuccess : Function, onFailure : Function){
		const {
			courseid,
			userid
		} = entry
		pool.query("DELETE FROM \"CourseRegistration\" WHERE courseID=$1 AND userID=$2"
			, [courseid, userid])
		.then(onSuccess)
		.catch(onFailure)

	}

	private static DBToI(entry : DBCourseRegistration) : CourseRegistration{
		if (this.checkEnum(entry.role)){
			return {...entry, role:localRoles[entry.role]}
		}
		throw new Error('non-existent enum type from db: '+entry.role)
	}
	private static checkEnum(role : string) : role is keyof typeof localRoles { 
		return role in localRoles
	}
}