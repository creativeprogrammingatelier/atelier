import {pool, extract, map, one, checkAvailable, pgDB } from "./HelperDB";
import {Course, convertCourse} from '../../../models/database/Course';
import { UUIDHelper } from "../helpers/UUIDHelper";

/**
 * @Author Rens Leendertz
 */

export class CourseDB {
	
	/**
	 * Many
	 */
	static async getAllCourses(DB : pgDB = pool) : Promise<Course[]> {
		return CourseDB.filterCourse({});
	}

	/**
	 * One
	 */
	static async getCourseByID(courseID : string, DB : pgDB = pool) : Promise<Course>{
		return CourseDB.filterCourse({courseID}, undefined, DB).then(one)
	}

	static async filterCourse(course : Course, limit? : number, DB : pgDB = pool) : Promise<Course[]>{
		const {
			courseID = undefined,
			name = undefined,
			creatorID = undefined,
			state = undefined
		} = course;
		const courseid = UUIDHelper.toUUID(courseID),
			creatorid = UUIDHelper.toUUID(creatorID);
			limit = limit===undefined || limit<0? undefined : limit
		return DB.query(`SELECT * FROM "Courses"
			WHERE
				($1::uuid IS NULL OR courseID=$1)
			AND ($2::text IS NULL OR name=$2)
			AND ($3::uuid IS NULL OR creator=$3)
			AND ($4::text IS NULL OR state=$4)
			LIMIT $5`, [courseid, name, creatorid, state, limit])
			.then(extract).then(map(convertCourse))
	}

	/**
	 * One
	 */
	static async addCourse(course : Course, DB : pgDB = pool) : Promise<Course>{
		checkAvailable(['name','state'], course)
		const {
			name,
			state,
			creatorID = undefined
		} = course;
		const creatorid = UUIDHelper.toUUID(creatorID);
		return DB.query(`INSERT INTO "Courses" 
			VALUES (DEFAULT, $1, $2, $3) 
			RETURNING *`, [name, state, creatorid])
		.then(extract).then(map(convertCourse)).then(one)
	}

	/**
	 * One
	 */
	static async deleteCourseByID(courseID : string, DB : pgDB = pool) : Promise<Course>{
		const courseid = UUIDHelper.toUUID(courseID);
		return DB.query(`DELETE FROM "Courses" 
		WHERE courseID=$1 
		RETURNING *`,[courseid])
		.then(extract).then(map(convertCourse)).then(one)
	}

	/**
	 * One
	 */
	static async updateCourse(course : Course, DB : pgDB = pool) : Promise<Course>{
		checkAvailable(['courseID'], course)
		const {
			courseID,
			name = undefined,
			state = undefined,
			creatorID = undefined
		} = course;
		const courseid = UUIDHelper.toUUID(courseID),
			creatorid = UUIDHelper.toUUID(creatorID);
		return DB.query(`UPDATE "Courses" SET 
			name=COALESCE($2, name),
			state=COALESCE($3,state),
			creator=COALESCE($4,creator)
			WHERE courseID=$1
			RETURNING *`,
			[courseid, name, state, creatorid])
		.then(extract).then(map(convertCourse)).then(one)
	}
}
