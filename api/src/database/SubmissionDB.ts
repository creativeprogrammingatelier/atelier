import {extract, map, one, pool, pgDB, checkAvailable  } from "./HelperDB";
import {Submission, DBSubmission, convertSubmission} from '../../../models/database/Submission';
import {submissionStatus, checkEnum} from '../../../enums/submissionStatusEnum'
import { UUIDHelper } from "../helpers/UUIDHelper";

/**
 * submissionID, userID, name, date, state
 * @Author Rens Leendertz
 */

export class SubmissionDB {
	/**
	 * return all submissions in the database
	 * if limit is specified and >= 0, that number of occurences will be send back.
	 */
	static async getAllSubmissions(limit?: number, DB : pgDB = pool) {
		return SubmissionDB.getRecents({}, limit !== undefined && limit >= 0 ? limit : undefined)
	}
	/*
	 * get all submissions of a user.
	 * if limit is specified and >= 0, that number of occurences will be send back.
	*/
	static async getUserSubmissions(userID: string, limit?: number, DB : pgDB = pool) {
		return SubmissionDB.getRecents({ userID }, limit !== undefined && limit >= 0 ? limit : undefined)

	}

	/**
	 * return a submission in the database
	 * undefined if specified id does not exist
	 */
	static async getSubmissionById(submissionID: string, DB : pgDB = pool) {
		return SubmissionDB.getRecents({ submissionID }, 1)
			.then(one)
	}
	/**
	 * 
	 * @param submission 
	 * @param limit 
	 */
	static async getSubmissionsByCourse(courseID: string, DB : pgDB = pool) {
		return SubmissionDB.getRecents({ courseID }, undefined);
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
	static async getRecents(submission: Submission, limit: number | undefined, DB : pgDB = pool) {
		const {
			submissionID = undefined,
			courseID = undefined,
			userID = undefined,
			name = undefined,
			date = undefined,
			state = undefined
		} = submission
		const submissionid = UUIDHelper.toUUID(submissionID),
			courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID);
		if (limit && limit < 0) limit = undefined
		return DB.query(`SELECT * 
			FROM "Submissions" 
			WHERE 
					($1::uuid IS NULL OR submissionID=$1)
				AND ($2::uuid IS NULL OR courseID=$2)
				AND ($3::uuid IS NULL OR userID=$3)
				AND ($4::text IS NULL OR name=$4)
				AND ($5::timestamp IS NULL OR date <= $5)
				AND ($6::text IS NULL OR state=$6)
			ORDER BY date DESC
			LIMIT $7`, [submissionid, courseid, userid, name, date, state, limit])
			.then(extract).then(map(convertSubmission))
	}

	/**
	 * add a new submission to the database.
	 *
	 * Even though not required, date and state can be given
	 * When not given, each of these columns will default to their standard value
	 */
	static async addSubmission(submission: Submission, DB : pgDB = pool) {
		checkAvailable(['courseID','userID','name'], submission)
		const {
			courseID,
			userID,
			name,
			date = new Date(),
			state = submissionStatus.new
		} = submission
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID);
		return DB.query(`INSERT INTO "Submissions" 
			VALUES (DEFAULT, $1, $2, $3, $4, $5) 
			RETURNING *`, [courseid, userid, name, date, state])
			.then(extract).then(map(convertSubmission)).then(one)
	}

	/**
	 *  delete an submission from the database.
	 */
	static async deleteSubmission(submissionID: string, DB : pgDB = pool) {
		const submissionid = UUIDHelper.toUUID(submissionID);
		return DB.query(`DELETE FROM "Submissions" 
			WHERE submissionID=$1 
			RETURNING *`, [submissionid])
			.then(extract).then(map(convertSubmission)).then(one)
	}
	/*
	 * update a submission submissionid is required, all others are optional.
	 * params not given will be left unchanged.
	 */
	static async updateSubmission(submission: Submission, DB : pgDB = pool) {
		checkAvailable(['submissionID'], submission)
		const {
			submissionID,
			courseID = undefined,
			userID = undefined,
			name = undefined,
			date = undefined,
			state = undefined
		} = submission
		const submissionid = UUIDHelper.toUUID(submissionID),
			courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID);
		return DB.query(`UPDATE "Submissions" SET
			courseID = COALESCE($2, courseID),
			userid = COALESCE($3, userid),
			name = COALESCE($4, name),
			date = COALESCE($5, date),
			state = COALESCE($6, state)
			WHERE submissionID=$1
			RETURNING *`
			, [submissionid, courseid, userid, name, date, state])
			.then(extract).then(map(convertSubmission)).then(one)
	}
}