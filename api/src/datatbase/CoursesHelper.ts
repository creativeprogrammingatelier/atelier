const HH = require("./HelperHelper")

import jwt from 'jsonwebtoken';
import {Constants} from '../lib/constants';
import {Request, Response} from 'express';
import {ICourse} from '../../../models/course';
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
		.then((res : {rows:ICourse[]}) => onSuccess(res.rows))
		.catch((err : Error) => onFailure(err))
	}

	static getCourseByID(courseid : number, onSuccess : Function, onFailure : Function){
		pool.query("SELECT * FROM \"Courses\" WHERE courseID =$1",[courseid])
		.then((res : {rows:ICourse[]}) => onSuccess(res.rows[0].courseid))
		.catch((err : Error) => onFailure(err))
	}
	static addCourse(course : ICourse, onSuccess : Function, onFailure : Function){
		const {
			name,
			state,
			creatorid = undefined
		} = course
		pool.query("INSERT INTO \"Courses\" VALUES (DEFAULT, $1, $2, $3) RETURNING *", [name, state, creatorid])
		.then((res:{rows:ICourse[]}) => onSuccess(res.rows[0].courseid))
		.catch((err: Error) => onFailure(err))
	}

	static deleteCourseByID(courseid : number, onSuccess : Function, onFailure : Function){
		pool.query("DELETE FROM \"Courses\" WHERE courseID=$1",[courseid])
		.then(onSuccess())
		.catch((err: Error)=>onFailure(err))
	}

	static updateCourse(course : ICourse, onSuccess : Function, onFailure : Function){
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
		.then((res:{rows:ICourse[]}) => onSuccess(res.rows[0]))
		.catch((err: Error) => onFailure(err))
	}
}