import {extract, map, one, pool, pgDB, checkAvailable, DBTools, _insert, searchify  } from "./HelperDB";
import {Submission, DBSubmission, convertSubmission, submissionToAPI, APISubmission} from '../../../models/database/Submission';
import {SubmissionStatus} from '../../../models/enums/SubmissionStatusEnum'
import { UUIDHelper } from "../helpers/UUIDHelper";
import { User } from "../../../models/database/User";
import { FileDB } from "./FileDB";
import { APIFile } from "../../../models/database/File";
import { submissionsView } from "./ViewsDB";
import { Sorting } from "../../../models/enums/SortingEnum";

/**
 * submissionID, userID, title, date, state
 * @Author Rens Leendertz
 */

export class SubmissionDB {
	/**
	 * return all submissions in the database
	 * if limit is specified and >= 0, that number of occurences will be send back.
	 */
	static async getAllSubmissions(params : DBTools = {}) {
		return SubmissionDB.getRecents(params)
	}
	/*
	 * get all submissions of a user.
	 * if limit is specified and >= 0, that number of occurences will be send back.
	*/
	static async getUserSubmissions(userID: string, params : DBTools = {}) {
		return SubmissionDB.getRecents({...params, userID })

	}

	/**
	 * return a submission in the database
	 * undefined if specified id does not exist
	 */
	static async getSubmissionById(submissionID: string, params : DBTools = {}) {
		return SubmissionDB.getRecents({...params, submissionID })
			.then(one)
	}
	/**
	 * 
	 * @param submission 
	 * @param limit 
	 */
	static async getSubmissionsByCourse(courseID: string, params : DBTools = {}) {
		return SubmissionDB.getRecents({...params, courseID });
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
	static async getRecents(submission: Submission & User) {
		const {
			submissionID = undefined,
			courseID = undefined,
			userID = undefined,
			//submission
			title = undefined,
			date = undefined,
			state = undefined,
			//user
			userName: name = undefined,
			email = undefined,
			globalRole: role = undefined,

			limit = undefined,
			offset = undefined,
			client = pool,

			addFiles = false,
		} = submission
		const submissionid = UUIDHelper.toUUID(submissionID),
			courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID);
		const query = pool.query(`SELECT * 
			FROM "SubmissionsView" 
			WHERE 
					($1::uuid IS NULL OR submissionID=$1)
				AND ($2::uuid IS NULL OR courseID=$2)
				AND ($3::uuid IS NULL OR userID=$3)
				--submission
				AND ($4::text IS NULL OR title=$4)
				AND ($5::timestamp IS NULL OR date <= $5)
				AND ($6::text IS NULL OR state=$6)
				--user
				AND ($7::text IS NULL OR userName=$7)
				AND ($8::text IS NULL OR email=$8)
				AND ($9::text IS NULL OR globalrole=$9)
			ORDER BY date DESC
			LIMIT $10
			OFFSET $11
			`, [submissionid, courseid, userid, 
				title, date, state, 
				name, email, role,
				limit, offset])
			.then(extract).then(map(submissionToAPI))
			if (addFiles){
				return SubmissionDB.addFiles(query, client)
			} else {
				return query
			}
		
	}

	static async searchSubmissions(searchString : string, extras: Submission & User) {
		checkAvailable(['currentUserID','courseID'], extras)
		const {
			submissionID = undefined,
			courseID = undefined,
			userID = undefined,
			//submission
			title = searchString,
			date = undefined,
			state = undefined,
			//user
			userName: name = undefined,
			email = undefined,
			globalRole: role = undefined,

			limit = undefined,
			offset = undefined,
			sorting = Sorting.datetime,
			currentUserID = undefined,
			client = pool,

			addFiles = false,
		} = extras
		const submissionid = UUIDHelper.toUUID(submissionID),
			courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID),
			currentuserid = UUIDHelper.toUUID(currentUserID),
			searchTitle = searchify(title)
		
		const query = pool.query(`
			SELECT s.* 
			FROM "SubmissionsView" as s, viewableSubmissions($12, $2) as opts
			WHERE 
				($1::uuid IS NULL OR s.submissionID=$1)
			AND ($2::uuid IS NULL OR s.courseID=$2)
			AND ($3::uuid IS NULL OR s.userID=$3)
			--submission
			AND ($4::text IS NULL OR s.title=$4)
			AND ($5::timestamp IS NULL OR s.date <= $5)
			AND ($6::text IS NULL OR s.state=$6)
			--user
			AND ($7::text IS NULL OR s.userName=$7)
			AND ($8::text IS NULL OR s.email=$8)
			AND ($9::text IS NULL OR s.globalrole=$9)
			AND s.submissionID = opts.submissionID
			ORDER BY ${sorting === Sorting.datetime? `date DESC` : `title`}
			LIMIT $10
			OFFSET $11
			`, [submissionid, courseid, userid, 
				searchTitle, date, state, 
				name, email, role,
				limit, offset, currentuserid])
			.then(extract).then(map(submissionToAPI))
			if (addFiles){
				return SubmissionDB.addFiles(query, client)
			} else {
				return query
			}
		
	}


	static async addFileSingle(query : Promise<APISubmission>, client : pgDB = pool){
		return SubmissionDB.addFiles(query.then(one => [one]), client).then(one)
	}

	static async addFiles(query : Promise<APISubmission[]>, client : pgDB = pool){
		const partials = await query
		return this._addFiles(partials)
	}
	static async _addFiles(partials : APISubmission[], client : pgDB = pool){
		//the mapping object is used as a map. this is fine
		// tslint:disable-next-line: no-any
		const mapping : any = {}
		partials.forEach(item => {
			mapping[item.ID] = item
		});
		const ids : string[] = partials.map(item => item.ID)
		
		const files = await FileDB.getFilesBySubmissionIDS(ids, {client})
		ids.forEach(id =>{
			if (!(id in files)){
				throw new Error("concurrentModificationException")
			}
			(mapping[id] as APISubmission).files = files[id]
		})
		return partials
	}

	/**
	 * add a new submission to the database.
	 *
	 * Even though not required, date and state can be given
	 * When not given, each of these columns will default to their standard value
	 */
	static async addSubmission(submission: Submission, DB : pgDB = pool) {
		checkAvailable(['courseID','userID','title'], submission)
		const {
			courseID,
			userID,
			title,
			date = new Date(),
			state = SubmissionStatus.new
		} = submission
		const courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID);
		return DB.query(`
		WITH insert AS (
			INSERT INTO "Submissions" 
			VALUES (DEFAULT, $1, $2, $3, $4, $5) 
			RETURNING *
		)
		${submissionsView('insert')}
		`, [courseid, userid, title, date, state])
			.then(extract).then(map(submissionToAPI)).then(one)
	}

	/**
	 *  delete an submission from the database.
	 * This adds the files associated with this submission to the response
	 */
	static async deleteSubmission(submissionID: string, client : pgDB = pool) {
		const submissionid = UUIDHelper.toUUID(submissionID);
		const files : APIFile[] = (await FileDB.getFilesBySubmissionIDS([submissionID], {client}))[submissionID]
		return client.query(`
		WITH delete AS (
			DELETE FROM "Submissions" 
			WHERE submissionID=$1 
			RETURNING *
		)
		${submissionsView('delete')}
		`, [submissionid])
			.then(extract).then(map(submissionToAPI)).then(one)
			.then(partial => {
				partial.files = files
				return partial
			})
	}
	/*
	 * update a submission. submissionid is required, all others are optional.
	 * params not given will be left unchanged.
	 */
	static async updateSubmission(submission: Submission, DB : pgDB = pool) {
		checkAvailable(['submissionID'], submission)
		const {
			submissionID,
			courseID = undefined,
			userID = undefined,
			title = undefined,
			date = undefined,
			state = undefined
		} = submission
		const submissionid = UUIDHelper.toUUID(submissionID),
			courseid = UUIDHelper.toUUID(courseID),
			userid = UUIDHelper.toUUID(userID);
		return DB.query(`
			WITH update AS (
				UPDATE "Submissions" SET
				courseID = COALESCE($2, courseID),
				userid = COALESCE($3, userid),
				title = COALESCE($4, title),
				date = COALESCE($5, date),
				state = COALESCE($6, state)
				WHERE submissionID=$1
				RETURNING *
			)
			${submissionsView('update')}`
			, [submissionid, courseid, userid, title, date, state])
			.then(extract).then(map(submissionToAPI)).then(one)
	}
}
