import {pool, extract, map, one, checkAvailable, pgDB, DBTools, searchify } from "./HelperDB";
import {Course, courseToAPIPartial, DBAPICourse} from '../../../models/database/Course';
import { UUIDHelper } from "../helpers/UUIDHelper";
import { FileDB } from "./FileDB";
import { User } from "../../../models/database/User";
import { CoursesView } from "./makeDB";

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
			role = undefined,
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
