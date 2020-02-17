const HH = require("./HelperHelper")

import {Course, DBCourse} from '../../../models/course';
import {courseState} from '../../../enums/courseStateEnum';

/**
 * @Author Rens Leendertz
 */
const pool = HH.pool

export default class CoursesHelper {
	/***
	*/
	static getAllCourses(onSuccess: Function, onFailure: Function) {
		pool.query("SELECT * FROM \"Courses\"")
		.then((res : {rows:DBCourse[]}) => onSuccess(res.rows.map(this.DBToI)))
		.catch(onFailure)
	}

	static getCourseByID(courseid : string, onSuccess : Function, onFailure : Function){
		pool.query("SELECT * FROM \"Courses\" WHERE courseID =$1",[courseid])
		.then((res : {rows:Course[]}) => onSuccess(res.rows[0].courseid))
		.catch(onFailure)
	}
	static addCourse(course : Course, onSuccess : Function, onFailure : Function){
		const {
			name,
			state,
			creatorid = undefined
		} = course
		pool.query("INSERT INTO \"Courses\" VALUES (DEFAULT, $1, $2, $3) RETURNING *", [name, state, creatorid])
		.then((res:{rows:Course[]}) => onSuccess(res.rows[0].courseid))
		.catch(onFailure)
	}

	static deleteCourseByID(courseid : string, onSuccess : Function, onFailure : Function){
		pool.query("DELETE FROM \"Courses\" WHERE courseID=$1",[courseid])
		.then(onSuccess)
		.catch(onFailure)
	}

	static updateCourse(course : Course, onSuccess : Function, onFailure : Function){
		const {
			courseid,
			name = undefined,
			state = undefined,
			creatorid = undefined
		} = course
		pool.query(`UPDATE \"Courses\" SET 
			name=COALESCE($2, name),
			state=COALESCE($3,state),
			creator=COALESCE($4,creator)
			WHERE courseID=$1`,
			[courseid, name, state, creatorid])
		.then((res:{rows:DBCourse[]}) => onSuccess(this.DBToI(res.rows[0])))
		.catch(onFailure)
	}

	private static DBToI(db : DBCourse) : courseState{
		if (this.checkEnum(db.state)){
			return courseState[db.state]
		}
		throw new Error('non-existent enum type from db: '+db.state)
	}
	private static checkEnum(str : string) : str is keyof typeof courseState {
		return str in courseState
	}
}
