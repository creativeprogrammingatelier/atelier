const HH = require("./HelperHelper")

import {Course, convert} from '../../../models/Course';

/**
 * @Author Rens Leendertz
 */
const {pool, one, map, extract} = HH;

export default class CoursesHelper {
	
	/**
	 * Many
	 */
	static getAllCourses() : Promise<Course[]> {
		return pool.query("SELECT * FROM \"Courses\"")
		.then(extract).then(map(convert))
	}

	/**
	 * One
	 */
	static getCourseByID(courseID : string) : Promise<Course>{
		return pool.query("SELECT * FROM \"Courses\" WHERE courseID =$1",[courseID])
		.then(extract).then(map(convert)).then(one)
	}
	/**
	 * One
	 */
	static addCourse(course : Course) : Promise<Course>{
		const {
			name,
			state,
			creatorID = undefined
		} = course;
		return pool.query("INSERT INTO \"Courses\" VALUES (DEFAULT, $1, $2, $3) RETURNING *", [name, state, creatorID])
		.then(extract).then(map(convert)).then(one)
	}

	/**
	 * One
	 */
	static deleteCourseByID(courseID : string) : Promise<Course>{
		return pool.query("DELETE FROM \"Courses\" WHERE courseID=$1 RETURNING *",[courseID])
		.then(extract).then(map(convert)).then(one)
	}

	/**
	 * One
	 */
	static updateCourse(course : Course) : Promise<Course>{
		const {
			courseID,
			name = undefined,
			state = undefined,
			creatorID = undefined
		} = course;
		return pool.query(`UPDATE \"Courses\" SET 
			name=COALESCE($2, name),
			state=COALESCE($3,state),
			creator=COALESCE($4,creator)
			WHERE courseID=$1
			RETURNING *`,
			[courseID, name, state, creatorID])
		.then(extract).then(map(convert)).then(one)
	}
}
