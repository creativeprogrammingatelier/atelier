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
	static getAllCourses(){
		return new Promise((
				resolve : (result : Course[]) => void, 
				reject: (error : Error) => void
			) => this._getAllCourses(resolve, reject))
	}

	static _getAllCourses(
			onSuccess: (result : Course[]) => void,
			onFailure : (error : Error) => void) {
		pool.query("SELECT * FROM \"Courses\"")
		.then((res : {rows:DBCourse[]}) => onSuccess(res.rows.map(this.DBToI)))
		.catch(onFailure)
	}

	static getCourseByID(courseid : string){
		return new Promise((
				resolve : (result : Course) => void, 
				reject: (error : Error) => void
			) => this._getCourseByID(courseid, resolve,reject))
	}

	static _getCourseByID(
			courseid : string,
			onSuccess : (result : Course) => void,
			onFailure : (error : Error) => void){
		pool.query("SELECT * FROM \"Courses\" WHERE courseID =$1",[courseid])
		.then((res : {rows:DBCourse[]}) => onSuccess(this.DBToI(res.rows[0])))
		.catch(onFailure)
	}
	static addCourse(course : Course){
		return new Promise((
				resolve : (result : Course) => void, 
				reject: (error : Error) => void
			) => this._addCourse(course, resolve,reject))
	}

	static _addCourse(
			course : Course,
			onSuccess : (result : Course) => void,
			onFailure : (error : Error) => void){
		const {
			name,
			state,
			creatorid = undefined
		} = course
		pool.query("INSERT INTO \"Courses\" VALUES (DEFAULT, $1, $2, $3) RETURNING *", [name, state, creatorid])
		.then((res:{rows:DBCourse[]}) => onSuccess(this.DBToI(res.rows[0])))
		.catch(onFailure)
	}

	static deleteCourseByID(courseid : string) : Promise<void>{
		return new Promise((
				resolve : () => void, 
				reject: (error : Error) => void
			) => this._deleteCourseByID(courseid, resolve,reject))
	}

	static _deleteCourseByID(
			courseid : string,
			onSuccess : () => void,
			onFailure : (error : Error) => void){
		pool.query("DELETE FROM \"Courses\" WHERE courseID=$1",[courseid])
		.then(onSuccess)
		.catch(onFailure)
	}

	static updateCourse(course : Course){
		return new Promise((
				resolve : (result : Course) => void, 
				reject: (error : Error) => void
			) => this._updateCourse(course, resolve,reject))
	}

	static _updateCourse(
			course : Course,
			onSuccess : (result : Course) => void,
			onFailure : (error : Error) => void){
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

	private static DBToI(db : DBCourse) : Course{
		if (this.checkEnum(db.state)){
			return {...db, state:courseState[db.state]}
		}
		throw new Error('non-existent enum type from db: '+db.state)
	}
	private static checkEnum(str : string) : str is keyof typeof courseState {
		return str in courseState
	}
}
