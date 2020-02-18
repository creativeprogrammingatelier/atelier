const HH = require("./HelperHelper")

import {Submission, DBSubmission} from '../../../models/Submission';
import {submissionStatus} from '../../../enums/submissionStatusEnum'
import RolePermissionHelper from './RolePermissionsHelper'
/**
 * submissionID, userID, name, date, state
 * @Author Rens Leendertz
 */
const pool = HH.pool
export default class SubmissionHelper {
	
	static getAllSubmissions() {
		return new Promise((
				resolve : (result : Submission[]) => void, 
				reject: (error : Error) => void
			) => this._getAllSubmissions(resolve, reject))
	}
	static _getAllSubmissions(
			onSuccess : (result : Submission[]) => void,
			onFailure : (error : Error) => void) {
		this._getRecents({}, undefined, onSuccess, onFailure)
	}

	static getSubmissionById(submissionID : string){
		return new Promise((
				resolve : (result : Submission[]) => void, 
				reject: (error : Error) => void
			) => this._getSubmissionById(submissionID, resolve, reject))
	}
	static _getSubmissionById(
			submissionID : string, 
			onSuccess : (result : Submission[]) => void,
			onFailure : (error : Error) => void) {
		this._getRecents({submissionid: submissionID}, undefined, onSuccess, onFailure)
	}

	static getUserSubmissions(userID : string){
		return new Promise((
				resolve : (result : Submission[]) => void, 
				reject: (error : Error) => void
			) => this._getUserSubmissions(userID, resolve, reject))
	}
	static _getUserSubmissions(
			userID : string, 
			onSuccess : (result : Submission[]) => void,
			onFailure : (error : Error) => void) {
		this._getRecents({userid:userID}, undefined, onSuccess, onFailure)
	}

	/*
	 * Give a submission object, all fields can be null
	 * if a field is given, the results will be filtered on that field.
	 * the results will be ordered by time.
	 * the @Param limit determines the number of results. 
	 * if no such limit is desired, make the field undefined

	 * The parameter date will be treated differently:
	 * if set, only submissions that are more recent will be displayed.
	 */
	static getRecents(submission : Submission, limit : number | undefined){
		return new Promise((
				resolve : (result : Submission[]) => void, 
				reject: (error : Error) => void
			) => this._getRecents(submission, limit, resolve, reject))
	}
	static _getRecents(
			submission : Submission,
			limit : number | undefined, 
			onSuccess : (result : Submission[]) => void, 
			onFailure : (error : Error) => void){
		const {
			submissionid = undefined,
			userid = undefined,
			name = undefined,
			date = undefined,
			state = undefined
		} = submission
		pool.query(`SELECT * 
			FROM \"Submissions\" 
			WHERE 
					($1 IS NULL OR submissionID=$1)
				AND ($2 IS NULL OR userID=$2)
				AND ($3 IS NULL OR name=$3)
				AND ($4 IS NULL OR date <= $4)
				AND ($5 IS NULL OR state=$5)
			ORDER BY date DESC
			LIMIT $6`,[submissionid, userid, name, date, state, limit])
		.then((res : {rows : DBSubmission[]}) => onSuccess(res.rows.map(this.DBToI)))
		.catch(onFailure)
	}

	/**
	 * add a new submission to the database.
	 *
	 * Even though discouraged, submissionid can be given.
	 * The same holds true for date and state
	 * When not given, each of these columns will default to their standard value
	 */
	static addSubmission(submission : Submission){
		return new Promise((
				resolve : (result : Submission) => void, 
				reject: (error : Error) => void
			) => this._addSubmission(submission, resolve, reject))
	}
	static _addSubmission(
			submission : Submission, 
			onSuccess : (result : Submission) => void,
			onFailure : (error : Error) => void) {
		const {
			submissionid = "DEFAULT",
			userid,
			name,
			date = "DEFAULT",
			state = "DEFAULT"
		} = submission
		pool.query("INSERT INTO \"Submissions\" VALUES ($1,$2,$3,$4,$5) RETURNING *"
			, [submissionid, userid, name, date, state])
		.then((res : {rows : DBSubmission[]}) => onSuccess(this.DBToI(res.rows[0])))
		.catch(onFailure)
	}

	static deleteSubmission(submission : Submission){
		return new Promise((
				resolve : () => void, 
				reject: (error : Error) => void
			) => this._deleteSubmission(submission, resolve, reject))
	}
	static _deleteSubmission(
			submission : Submission, 
			onSuccess : () => void, 
			onFailure : (error : Error) => void){
		const {
			submissionid
		} = submission
		pool.query("DELETE FROM \"Submissions\" WHERE submissionID=$1",[submissionid])
		.then(onSuccess)
		.catch(onFailure)
	}
	static updateSubmission(submission : Submission){
		return new Promise((
				resolve : (result : Submission) => void, 
				reject: (error : Error) => void
			) => this._updateSubmission(submission, resolve, reject))
	}
	static _updateSubmission(
			submission : Submission, 
			onSuccess : (result : Submission) => void, 
			onFailure : (error : Error) => void){
		const {
			submissionid,
			userid = undefined,
			name = undefined,
			date = undefined,
			state = undefined
		} = submission
		pool.query(`UPDATE \"Submission\" SET
			userid = COALESCE($2, userid),
			name = COALESCE($3, name),
			date = COALESCE($4, date),
			state = COALESCE($5, state)
			WHERE submissionID=$1
			RETURNING *`
			, [submissionid, userid, name, date, state])
		.then((res : {rows:DBSubmission[]}) => onSuccess(this.DBToI(res.rows[0])))
		.catch(onFailure)
	}


	private static DBToI(db : DBSubmission) : Submission{
		if (this.checkEnum(db.state)){
			return {...db, state: submissionStatus[db.state]}
		}
		throw new Error('non-existent enum type from db: '+db.state)
	}
	private static checkEnum(str : string) : str is keyof typeof submissionStatus {
		return str in submissionStatus
	}
}