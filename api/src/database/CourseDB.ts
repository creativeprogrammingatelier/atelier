import {pool, extract, map, one, checkAvailable, pgDB, DBTools, searchify, toBin } from "./HelperDB";
import {Course, courseToAPIPartial, DBAPICourse, courseToAPI} from '../../../models/database/Course';
import { UUIDHelper } from "../helpers/UUIDHelper";
import { FileDB } from "./FileDB";
import { User } from "../../../models/database/User";
import { CoursesView } from "./ViewsDB";
import { PermissionEnum } from "../../../models/enums/permissionEnum";
import { courseRole } from "../../../models/enums/courseRoleEnum";

/**
 * @Author Rens Leendertz
 */

export class CourseDB {
	
	/**
	 * get a list of all courses
	 * @param params optional; send some extra info, such as limit and offset.
	 */
	static async getAllCourses(params : DBTools = {}) {
		return CourseDB.filterCourse(params);
	}

	/**
	 * One
	 */
	static async getCourseByID(courseID : string, client : pgDB = pool) {
		return CourseDB.filterCourse({courseID, client}).then(one)
	}

	static async filterCourse(course : Course & User) {
		const {
			courseID = undefined,
			courseName = undefined,
			creatorID = undefined,
			state = undefined,
			//creator
			userName = undefined,
			email = undefined,
			globalRole: role = undefined,
			//dbtools
			limit = undefined,
			offset = undefined,
			client = pool,
		} = course;
		const courseid = UUIDHelper.toUUID(courseID),
			creatorid = UUIDHelper.toUUID(creatorID);
		const 
			searchCourse = searchify(courseName),
			searchUser = searchify(userName)

		const args = [	courseid, creatorid, //ids
						searchCourse, state, //course
						searchUser, email, role, //creator
						limit, offset
					]
		type argType = typeof args;
		return client.query<DBAPICourse, argType>(`SELECT * FROM "CoursesView"
			WHERE
				($1::uuid IS NULL OR courseID=$1)
			AND ($2::uuid IS NULL OR creator=$2)
			--course
			AND ($3::text IS NULL OR courseName ILIKE $3)
			AND ($4::text IS NULL OR state=$4)
			--creator
			AND ($5::text IS NULL OR userName ILIKE $5)
			AND ($6::text IS NULL OR email ILIKE $6)
			AND ($7::text IS NULL OR globalRole=$7)

			ORDER BY state, courseName, courseID
			LIMIT $8
			OFFSET $9`, args)
			.then(extract).then(map(courseToAPIPartial))
	}

	/**
	 * One
	 */
	static async addCourse(course : Course) {
		checkAvailable(['courseName','state','creatorID'], course)
		const {
			courseName,
			state,
			creatorID,
			client = pool
		} = course;
		const creatorid = UUIDHelper.toUUID(creatorID);
		return client.query(`
		WITH insert as (
			INSERT INTO "Courses" 
			VALUES (DEFAULT, $1, $2, $3) 
			RETURNING *
		)
		${CoursesView('insert')}
		`, [courseName, state, creatorid])
		.then(extract).then(map(courseToAPIPartial)).then(one)
		.then(res => {
			
			return res
		})
	}
	/** @TODO instead of being registered, check the permissions of a user
	 */
	static async searchCourse(searchString : string, extras : Course & User){
		const {
			courseID = undefined,
			courseName = searchString,
			creatorID = undefined,
			state = undefined,
			//creator
			userName = undefined,
			email = undefined,
			globalRole = undefined,
			//current user
			currentUserID = undefined,
			//dbtools
			limit = undefined,
			offset = undefined,
			client = pool,
		} = extras;
		const courseid = UUIDHelper.toUUID(courseID),
			creatorid = UUIDHelper.toUUID(creatorID),
			currentuserid = UUIDHelper.toUUID(currentUserID)
		const 
			searchCourse = searchify(courseName)

		const args = [	courseid, creatorid, //ids
						searchCourse, state, //course
						userName, email, globalRole, // creator
						currentuserid, //current user
						limit, offset
					]
		type argType = typeof args;
		return client.query(`
			SELECT c.*, cu.courseRole as currentCourseRole, cu.globalRole as currentGlobalRole, cu.permission as currentPermission 
			FROM "CoursesView" as c, "CourseUsersViewAll" as cu
			WHERE
			--current user
				cu.userID = $8
			AND c.courseID = cu.courseID
			AND 
			( -- either registered
				cu.courseRole != '${courseRole.unregistered}'	
			OR -- or permission
				cu.permission & b'${toBin(2**PermissionEnum.viewAllCourses)}' = b'${toBin(2**PermissionEnum.viewAllCourses)}'
			)
			--ids
			AND ($1::uuid IS NULL OR c.courseID=$1)
			AND ($2::uuid IS NULL OR c.creator=$2)
			--course
			AND ($3::text IS NULL OR c.courseName ILIKE $3)
			AND ($4::text IS NULL OR c.state=$4)
			--creator
			AND ($5::text IS NULL OR c.userName = $5)
			AND ($6::text IS NULL OR c.email = $6)
			AND ($7::text IS NULL OR c.globalRole=$7)

			ORDER BY c.state, c.courseName, c.courseID
			LIMIT $9
			OFFSET $10
			`, args)
			.then(extract).then(map(courseToAPI))
	}

	/**
	 * One
	 */
	static async deleteCourseByID(courseID : string, client : pgDB = pool) {
		const courseid = UUIDHelper.toUUID(courseID);
		return client.query(`
		WITH delete AS (
			DELETE FROM "Courses" 
			WHERE courseID=$1 
			RETURNING *
		)
		${CoursesView('delete')}
		`,[courseid])
		.then(extract).then(map(courseToAPIPartial)).then(one)
	}

	/**
	 * One
	 */
	static async updateCourse(course : Course) {
		checkAvailable(['courseID'], course)
		const {
			courseID,
			courseName = undefined,
			state = undefined,
			creatorID = undefined,
			client =pool
		} = course;
		const courseid = UUIDHelper.toUUID(courseID),
			creatorid = UUIDHelper.toUUID(creatorID);
		return client.query(`
		WITH update AS (
			UPDATE "Courses" SET 
			courseName=COALESCE($2, courseName),
			state=COALESCE($3,state),
			creator=COALESCE($4,creator)
			WHERE courseID=$1
			RETURNING *
		)
		${CoursesView('update')}
		`,
			[courseid, courseName, state, creatorid])
		.then(extract).then(map(courseToAPIPartial)).then(one)
	}
}
