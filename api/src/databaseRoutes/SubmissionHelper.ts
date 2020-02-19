const HH = require("./HelperHelper")

import {Submission, DBSubmission, convert} from '../../../models/Submission';
import {submissionStatus, checkEnum} from '../../../enums/submissionStatusEnum'
import RolePermissionHelper from './RolePermissionsHelper'
/**
 * submissionID, userID, name, date, state
 * @Author Rens Leendertz
 */
const {pool, extract, one, map}= HH

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
		return SubmissionHelper.getRecents({userID}, limit !== undefined && limit >=0?limit:undefined)

	}

	/**
	 * return a submission in the database
	 * undefined if specified id does not exist
	 */
	static getSubmissionById(submissionID : string){
		return SubmissionHelper.getRecents({submissionID}, 1)
			.then(one)
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
		const {
			submissionID = undefined,
			userID = undefined,
			name = undefined,
			date = undefined,
			state = undefined
		} = submission
		return pool.query(`SELECT * 
			FROM \"Submissions\" 
			WHERE 
					($1::uuid IS NULL OR submissionID=$1)
				AND ($2::uuid IS NULL OR userID=$2)
				AND ($3::text IS NULL OR name=$3)
				AND ($4::timestamp IS NULL OR date <= $4)
				AND ($5::text IS NULL OR state=$5)
			ORDER BY date DESC
			LIMIT $6`,[submissionID, userID, name, date, state, limit])
		.then(extract).then(map(convert))
	}

	/**
	 * add a new submission to the database.
	 *
	 * Even though not required, date and state can be given
	 * When not given, each of these columns will default to their standard value
	 */
	static addSubmission(submission : Submission) {
		const {
			userID,
			name,
			date = new Date(),
			state = submissionStatus.new
		} = submission
		return pool.query("INSERT INTO \"Submissions\" VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *"
			, [userID, name, date, state])
		.then(extract).then(map(convert)).then(one)
	}

	/* delete an submission from the database.
	 *
	 */
	static deleteSubmission(submissionid : string){
		return pool.query("DELETE FROM \"Submissions\" WHERE submissionID=$1",[submissionid])
	}
	/*
	 * update a submission submissionid is required, all others are optional.
	 * params not given will be left unchanged.
	 */
	static updateSubmission(submission : Submission){
		const {
			submissionID,
			userID = undefined,
			name = undefined,
			date = undefined,
			state = undefined
		} = submission
		return pool.query(`UPDATE \"Submissions\" SET
			userid = COALESCE($2, userid),
			name = COALESCE($3, name),
			date = COALESCE($4, date),
			state = COALESCE($5, state)
			WHERE submissionID=$1
			RETURNING *`
			, [submissionID, userID, name, date, state])
		.then(extract).then(map(convert)).then(one)
	}
}