const HH = require("./HelperHelper")

import {Submission, DBSubmission, convertSubmission} from '../../../models/Submission';
import {submissionStatus, checkEnum} from '../../../enums/submissionStatusEnum'
import RolePermissionHelper from './RolePermissionsHelper'
/**
 * submissionID, userID, name, date, state
 * @Author Rens Leendertz
 */
const {query, extract, one, map}= HH

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
	/**
	 * 
	 * @param submission 
	 * @param limit 
	 */
	static getSubmissionsByCourse(courseID : string){
		return SubmissionHelper.getRecents({courseID}, undefined);
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
			courseID = undefined,
			userID = undefined,
			name = undefined,
			date = undefined,
			state = undefined
		} = submission
		if (limit && limit<0) limit=undefined
		return query(`SELECT * 
			FROM \"Submissions\" 
			WHERE 
					($1::uuid IS NULL OR submissionID=$1)
				AND ($2::uuid IS NULL OR courseID=$2)
				AND ($3::uuid IS NULL OR userID=$3)
				AND ($4::text IS NULL OR name=$4)
				AND ($5::timestamp IS NULL OR date <= $5)
				AND ($6::text IS NULL OR state=$6)
			ORDER BY date DESC
			LIMIT $7`,[submissionID, courseID, userID, name, date, state, limit])
		.then(extract).then(map(convertSubmission))
	}

	/**
	 * add a new submission to the database.
	 *
	 * Even though not required, date and state can be given
	 * When not given, each of these columns will default to their standard value
	 */
	static addSubmission(submission : Submission) {
		const {
			courseID,
			userID,
			name,
			date = new Date(),
			state = submissionStatus.new
		} = submission
		return query("INSERT INTO \"Submissions\" VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING *"
			, [courseID, userID, name, date, state])
		.then(extract).then(map(convertSubmission)).then(one)
	}

	/* delete an submission from the database.
	 *
	 */
	static deleteSubmission(submissionID : string){
		return query("DELETE FROM \"Submissions\" WHERE submissionID=$1 RETURNING *",[submissionID])
		.then(extract).then(map(convertSubmission)).then(one)
	}
	/*
	 * update a submission submissionid is required, all others are optional.
	 * params not given will be left unchanged.
	 */
	static updateSubmission(submission : Submission){
		const {
			submissionID,
			courseID = undefined,
			userID = undefined,
			name = undefined,
			date = undefined,
			state = undefined
		} = submission
		return query(`UPDATE \"Submissions\" SET
			courseID = COALESCE($2, courseID),
			userid = COALESCE($3, userid),
			name = COALESCE($4, name),
			date = COALESCE($5, date),
			state = COALESCE($6, state)
			WHERE submissionID=$1
			RETURNING *`
			, [submissionID, courseID, userID, name, date, state])
		.then(extract).then(map(convertSubmission)).then(one)
	}
}