import {pool, extract, map, one, checkAvailable, pgDB, DBTools } from "./HelperDB";
import {Course, convertCourse, APICourse, courseToAPI, DBAPICourse} from '../../../models/database/Course';
import { UUIDHelper } from "../helpers/UUIDHelper";
import { FileDB } from "./FileDB";

/**
 * @Author Rens Leendertz
 */

export class CourseDB {
	
	/**
	 * get a list of all courses
	 * @param params optional; send some extra info, such as limit and offset.
	 */
	static async getAllCourses(params : DBTools = {}) : Promise<APICourse[]> {
		return CourseDB.filterCourse(params);
	}

	/**
	 * One
	 */
	static async getCourseByID(courseID : string, client : pgDB = pool) : Promise<APICourse>{
		return CourseDB.filterCourse({courseID, client}).then(one)
	}

	static async filterCourse(course : Course) : Promise<APICourse[]>{
		const {
			courseID = undefined,
			name = undefined,
			creatorID = undefined,
			state = undefined,
			limit = undefined,
			offset = undefined,
			client = pool,
		} = course;
		const courseid = UUIDHelper.toUUID(courseID),
			creatorid = UUIDHelper.toUUID(creatorID);

		const args = [courseid, name, creatorid, state, limit, offset]
		type argType = typeof args;
		return client.query<DBAPICourse, argType>(`SELECT * FROM "Courses"
			WHERE
				($1::uuid IS NULL OR courseID=$1)
			AND ($2::text IS NULL OR name=$2)
			AND ($3::uuid IS NULL OR creator=$3)
			AND ($4::text IS NULL OR state=$4)
			ORDER BY state, name, courseID
			LIMIT $5
			OFFSET $6`, args)
			.then(extract).then(map(courseToAPI))
	}

	/**
	 * One
	 */
	static async addCourse(course : Course) : Promise<APICourse>{
		checkAvailable(['name','state'], course)
		const {
			name,
			state,
			creatorID = undefined,
			client = pool
		} = course;
		const creatorid = UUIDHelper.toUUID(creatorID);
		return client.query(`INSERT INTO "Courses" 
			VALUES (DEFAULT, $1, $2, $3) 
			RETURNING *`, [name, state, creatorid])
		.then(extract).then(map(courseToAPI)).then(one)
		.then(res => {
			FileDB.createNullFile(res.ID);
			return  res
		})
	}

	/**
	 * One
	 */
	static async deleteCourseByID(courseID : string, client : pgDB = pool) : Promise<Course>{
		const courseid = UUIDHelper.toUUID(courseID);
		return client.query(`DELETE FROM "Courses" 
		WHERE courseID=$1 
		RETURNING *`,[courseid])
		.then(extract).then(map(convertCourse)).then(one)
	}

	/**
	 * One
	 */
	static async updateCourse(course : Course) : Promise<Course>{
		checkAvailable(['courseID'], course)
		const {
			courseID,
			name = undefined,
			state = undefined,
			creatorID = undefined,
			client =pool
		} = course;
		const courseid = UUIDHelper.toUUID(courseID),
			creatorid = UUIDHelper.toUUID(creatorID);
		return client.query(`UPDATE "Courses" SET 
			name=COALESCE($2, name),
			state=COALESCE($3,state),
			creator=COALESCE($4,creator)
			WHERE courseID=$1
			RETURNING *`,
			[courseid, name, state, creatorid])
		.then(extract).then(map(convertCourse)).then(one)
	}
}
