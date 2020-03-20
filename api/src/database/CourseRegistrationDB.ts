import {pool, extract, map, one, toBin, pgDB, checkAvailable, DBTools, permissionBits, noNull } from "./HelperDB";
import {CourseRoleDB} from './CourseRoleDB'
import { UUIDHelper, ID64 } from "../helpers/UUIDHelper";
import { CoursePartial } from "../../../models/api/Course";
import { User } from "../../../models/database/User";
import { Permission } from "../../../models/api/Permission";
import { APICourse, coursePartialToAPI } from "../../../models/database/Course";
import { CourseUsersSingle} from "./ViewsDB";
import { CourseUser, CourseUserToAPI, APICourseUser } from "../../../models/database/CourseUser";
import { getEnum } from "../../../models/enums/enumHelper";
import { globalRole } from "../../../models/enums/globalRoleEnum";
import { courseRole } from "../../../models/enums/courseRoleEnum";
import { InvalidDatabaseResponseError } from "./DatabaseErrors";
/**
 * courseID, userID, role, permission
 * @Author Rens Leendertz
 */

 export class CourseRegistrationDB {

	/**
	 * add info about roles & permissions to a list of courses.
	 * @param partials a course without a currentUserPermissions object
	 * @param user the user that is requesting its permissions
	 * @param params extra params in case a client is used
	 */
	static async addPermissionsCourse(partials : CoursePartial[], user: User, params : DBTools = {}){
		checkAvailable(['userID'], user)
		const courseIDs = partials.map(part => part.ID)
		//this object is used as a map.
		// tslint:disable-next-line: no-any
		const mapping : any = {}
		const {
			userID,
			client = pool
		} = user
		const result = await CourseRegistrationDB.getSubset(courseIDs, [noNull(userID)], params)
		result.forEach(item => {
			const id = item.courseID;
			mapping[id] = item.permission
		});
		const total : APICourse[] = partials.map(part => {
			if (!(part.ID in mapping)){
				throw new InvalidDatabaseResponseError("getSubset somoehow did not return entries for a requested courseID.")
			}
			return coursePartialToAPI(part, mapping[part.ID] as Permission)
		})
		return total
	}

	/**
	 * get a subset of entries.
	 * if an entry does not exist in the database, it will be replaced by an entry with role 'unregistered', 
	 * and no extra permissions besides the ones the user receives through his global user account.
	 * @param courses a subset of courses to return for
	 * @param users a subset of users to return for
	 * @param params 
	 */
	static async getSubset(courses : string[] | undefined, users : string[] | undefined, params : DBTools = {}) {
		const {client = pool} = params
		if (courses) courses = courses.map<string>(UUIDHelper.toUUID)
		if (users) users = users.map<string>(UUIDHelper.toUUID)

		return client.query(`
			SELECT *
			FROM "CourseUsersView"
			WHERE 
				($1::uuid[] IS NULL OR courseID = ANY($1))
			AND ($2::uuid[] IS NULL OR userID = ANY($2))
		`, [courses, users]).then(extract).then(map(CourseUserToAPI))
	}

	static async filterCourseRegistration(registration : CourseUser) : Promise<APICourseUser[]>{
		const {
			userID = undefined,
			courseID = undefined,
			userName = undefined,
			email = undefined,

			globalRole = undefined,
			courseRole = undefined,
			permission = undefined,

			client = pool
		}=registration
		const userid = UUIDHelper.toUUID(userID),
			courseid = UUIDHelper.toUUID(courseID)
		return client.query(`
			SELECT *
			FROM "CourseUsersView"
			WHERE
				($1::uuid IS NULL OR userID = $1)
			AND ($2::uuid IS NULL OR courseID = $2)
			AND ($3::text IS NULL OR userName =$3)
			AND ($4::text IS NULL OR email =$4)
			AND ($5::text IS NULL OR globalRole =$5)
			AND ($6::text IS NULL OR courseRole =$6)
			AND ($7::bit(${permissionBits}) IS NULL OR (permission & $7) = $7)
		`, [userid, courseid, userName, email, globalRole, courseRole, toBin(permission)])
		.then(extract).then(map(CourseUserToAPI))
	}

	/**
	 * return all entries in this table, with permissions set correctly
	 */
	 static async getAllEntries(params : DBTools = {}) {
		return CourseRegistrationDB.getSubset(undefined,undefined,params);
	 }

	/**
	 * get all users entered in a specific course. permissions set correctly
	 */
	static async getEntriesByCourse(courseID : ID64, params : DBTools = {}) {
		return CourseRegistrationDB.getSubset([courseID],undefined, params)
	}

	/**
	 * get all courses a user is entered into. permissions set correctly
	 */
	static async getEntriesByUser(userID : ID64, params : DBTools = {}) {
		return 	CourseRegistrationDB.getSubset(undefined, [userID], params)
	}

	static async getSingleEntry(courseID : string, userID : string, params : DBTools = {}){
		return CourseRegistrationDB.getSubset([courseID], [userID], params).then(one)
	}

	/**
	 * add a new entry.
	 * courseID, userID and courseRole are required. permission will default to no elevation
	 * others will be ignored.
	 */
	static async addEntry(entry : CourseUser){
		checkAvailable(['courseID','userID','courseRole'], entry);
		const {
			courseID,
			userID,
			courseRole: role,
			permission = 0,

			client =pool
		} = entry;
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID),
			perm = toBin(permission)
		return client.query(`
		WITH insert AS (
			INSERT INTO "CourseRegistration" 
			VALUES ($1,$2,$3,$4) 
			RETURNING *
		)
		${CourseUsersSingle('insert')}
		`, [courseid, userid, role, perm])
		.then(extract).then(map(CourseUserToAPI)).then(one)
	}

	/**
	 * update the role of a user. 
	 *
	 * permission field will be ignored
	 */
	static async updateRole(entry : CourseUser){
		checkAvailable(['courseID','userID','courseRole'], entry)
		const {
			courseID,
			userID,
			courseRole: role,

			client = pool
		} = entry;
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID);
		return client.query(`
		WITH update as (
			UPDATE "CourseRegistration" SET 
			courseRole=COALESCE($3, courseRole)
			WHERE courseID=$1 AND userID=$2
			RETURNING *
		)
		${CourseUsersSingle('update')}
	 	`, [courseid, userid, role])
		.then(extract).then(map(CourseUserToAPI)).then(one)
	}

	/**
	 * allow an entry in the database some extra permissions.
	 * The given field will be unioned with the current state.
	 * the role field will be ignored, others are mandatory.
	 */
	static async addPermission(entry : CourseUser){
		checkAvailable(['courseID','userID','permission'], entry)
		const {
			courseID,
			userID,
			permission,

			client = pool
		} = entry;
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID),
			perm = toBin(permission);
		return client.query(`
		WITH update AS (
			UPDATE "CourseRegistration" SET 
			permission=permission | $3
			WHERE courseID=$1 AND userID=$2
			RETURNING *
		)
		${CourseUsersSingle('update')}
		 `, [courseid, userid, perm])
		.then(extract).then(map(CourseUserToAPI)).then(one)
	}

	/**
	 * revoke some permissions from an entry in the database.
	 * The set permissions will be removed if set in the current state.
	 * A user will keep the permissions associated with its role. these cannot be removed.
	 * the role field will be ignored, others are mandatory.
	 */
	static async removePermission(entry : CourseUser){
		checkAvailable(['courseID','userID','permission'], entry)
		const {
			courseID,
			userID,
			permission,

			client = pool
		} = entry;
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID),
			perm = toBin(permission);
		return client.query(`
		WITH update AS (
			UPDATE "CourseRegistration" SET 
			permission=permission & ~($3::bit(${permissionBits}))
			WHERE courseID=$1 AND userID=$2
			RETURNING *
		)
		${CourseUsersSingle('update')}
		`, [courseid, userid, perm])
		.then(extract).then(map(CourseUserToAPI)).then(one)
	}

	/**
	 * remove a user from a course. 
	 * permission and role will be ignored.
	 */
	static async deleteEntry(entry : CourseUser){
		checkAvailable(['courseID','userID'], entry)
		const {
			courseID,
			userID,

			client = pool
		} = entry;
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID)
		return client.query(`
		WITH delete AS (
			DELETE FROM "CourseRegistration" 
			WHERE courseID=$1 AND userID=$2 
			RETURNING *
		)
		${CourseUsersSingle('delete')}
		 `, [courseid, userid])
		.then(extract).then(map(CourseUserToAPI)).then(one)
	}
}