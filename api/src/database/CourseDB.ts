import {pool, extract, map, one, pgDB } from "./HelperDB";
import {Course, convertCourse} from '../../../models/database/Course';

/**
 * @Author Rens Leendertz
 */

export class CourseDB {
	
	/**
	 * Many
	 */
	static getAllCourses(DB : pgDB = pool) : Promise<Course[]> {
		return DB.query(`SELECT * FROM "Courses"`)
		.then(extract).then(map(convertCourse))
	}

	/**
	 * One
	 */
	static getCourseByID(courseID : string, DB : pgDB = pool) : Promise<Course>{
		return DB.query(`SELECT * FROM "Courses" WHERE courseID =$1`,[courseID])
		.then(extract).then(map(convertCourse)).then(one)
	}
	/**
	 * One
	 */
	static addCourse(course : Course, DB : pgDB = pool) : Promise<Course>{
		const {
			name,
			state,
			creatorID = undefined
		} = course;
		return DB.query(`INSERT INTO "Courses" 
			VALUES (DEFAULT, $1, $2, $3) 
			RETURNING *`, [name, state, creatorID])
		.then(extract).then(map(convertCourse)).then(one)
	}

	/**
	 * One
	 */
	static deleteCourseByID(courseID : string, DB : pgDB = pool) : Promise<Course>{
		return DB.query(`DELETE FROM "Courses" 
		WHERE courseID=$1 
		RETURNING *`,[courseID])
		.then(extract).then(map(convertCourse)).then(one)
	}

	/**
	 * One
	 */
	static updateCourse(course : Course, DB : pgDB = pool) : Promise<Course>{
		const {
			courseID,
			name = undefined,
			state = undefined,
			creatorID = undefined
		} = course;
		return DB.query(`UPDATE "Courses" SET 
			name=COALESCE($2, name),
			state=COALESCE($3,state),
			creator=COALESCE($4,creator)
			WHERE courseID=$1
			RETURNING *`,
			[courseID, name, state, creatorID])
		.then(extract).then(map(convertCourse)).then(one)
	}
}
