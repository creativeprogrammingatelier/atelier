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
	/**
	 * return all submissions in the database
	 * if limit is specified and >= 0, that number of occurences will be send back.
	 */
	static getAllSubmissions(limit? : number) {
		return SubmissionHelper.getRecents({}, limit !== undefined && limit >=0?limit:undefined)
	}
	/*
	 * get all submissions of a user.
	 * if limit is specified and >= 0, that number of occurences will be send back.
	*/
	static getUserSubmissions(userID : string, limit? : number){
		return SubmissionHelper.getRecents({userid:userID}, limit !== undefined && limit >=0?limit:undefined)
	}

	/**
	 * return a submission in the database
	 * undefined if specified id does not exist
	 */
	static getSubmissionById(submissionID : string){
		return new Promise((
				resolve : (result : Submission) => void, 
				reject: (error : Error) => void
			) => SubmissionHelper._getSubmissionById(submissionID, SubmissionHelper.sendOne(resolve), reject))
	}

	static _getSubmissionById(
			submissionID : string, 
			onSuccess : (result : Submission[]) => void,
			onFailure : (error : Error) => void) {
		SubmissionHelper._getRecents({submissionid: submissionID}, 1, onSuccess, onFailure)
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
			) => SubmissionHelper._getRecents(submission, limit, resolve, reject))
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
					($1::uuid IS NULL OR submissionID=$1)
				AND ($2::uuid IS NULL OR userID=$2)
				AND ($3::text IS NULL OR name=$3)
				AND ($4::timestamp IS NULL OR date <= $4)
				AND ($5::text IS NULL OR state=$5)
			ORDER BY date DESC
			LIMIT $6`,[submissionid, userid, name, date, state, limit])
		.then((res : {rows : DBSubmission[]}) => onSuccess(res.rows.map(SubmissionHelper.DBToI)))
		.catch(onFailure)
	}

	/**
	 * add a new submission to the database.
	 *
	 * Even though not required, date and state can be given
	 * When not given, each of these columns will default to their standard value
	 */
	static addSubmission(submission : Submission){
		return new Promise((
				resolve : (result : Submission) => void, 
				reject: (error : Error) => void
			) => SubmissionHelper._addSubmission(submission, resolve, reject))
	}
	static _addSubmission(
			submission : Submission, 
			onSuccess : (result : Submission) => void,
			onFailure : (error : Error) => void) {
		const {
			userid,
			name,
			date = new Date(),
			state = submissionStatus.new
		} = submission
		pool.query("INSERT INTO \"Submissions\" VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *"
			, [userid, name, date, state])
		.then((res : {rows : DBSubmission[]}) => onSuccess(SubmissionHelper.DBToI(res.rows[0])))
		.catch(onFailure)
	}

	/* delete an submission from the database.
	 *
	 */
	static deleteSubmission(submissionID : string) : Promise<void>{
		return new Promise((
				resolve : () => void, 
				reject: (error : Error) => void
			) => SubmissionHelper._deleteSubmission(submissionID, resolve, reject))
	}
	static _deleteSubmission(
			submissionid : string, 
			onSuccess : () => void, 
			onFailure : (error : Error) => void){
		pool.query("DELETE FROM \"Submissions\" WHERE submissionID=$1",[submissionid])
		.then(onSuccess)
		.catch(onFailure)
	}
	/*
	 * update a submission submissionid is required, all others are optional.
	 * params not given will be left unchanged.
	 */
	static updateSubmission(submission : Submission){
		return new Promise((
				resolve : (result : Submission) => void, 
				reject: (error : Error) => void
			) => SubmissionHelper._updateSubmission(submission, resolve, reject))
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
		pool.query(`UPDATE \"Submissions\" SET
			userid = COALESCE($2, userid),
			name = COALESCE($3, name),
			date = COALESCE($4, date),
			state = COALESCE($5, state)
			WHERE submissionID=$1
			RETURNING *`
			, [submissionid, userid, name, date, state])
		.then((res : {rows:DBSubmission[]}) => onSuccess(SubmissionHelper.DBToI(res.rows[0])))
		.catch(onFailure)
	}

	/**
	 * receive a function F.
	 * F requires a single item.
	 * send back a new function that sends the first item of a list to F.
	 * 
	 */
	private static sendOne(onSuccess : (result : Submission) => void) {
		return (result : Submission[]) => onSuccess(result[0])
	}


	private static DBToI(db : DBSubmission) : Submission{
		if (SubmissionHelper.checkEnum(db.state)){
			return {...db, state: submissionStatus[db.state]}
		}
		throw new Error('non-existent enum type from db: '+db.state)
	}
	private static checkEnum(str : string) : str is keyof typeof submissionStatus {
		return str in submissionStatus
	}
}