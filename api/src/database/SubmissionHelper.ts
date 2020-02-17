const HH = require("./HelperHelper")

import {Submission} from '../../../models/Submission';

import RolePermissionHelper from './RolePermissionsHelper'
/**
 * submissionID, userID, name, date, state
 * @Author Rens Leendertz
 */
const pool = HH.pool
export default class SubmissionHelper {
	static getAllSubmissions(onSuccess : Function, onFailure : Function) {
		pool.query("SELECT * FROM \"Submissions\"")
		.then((res : {rows:Submission[]}) => onSuccess(res.rows))
		.catch(onFailure)
	}

	static getSubmissionById(submissionID : string, onSuccess : Function, onFailure : Function) {
		pool.query("SELECT * FROM \"Submissions\" WHERE submissionID=$1",[submissionID])
		.then((res : {rows:Submission[]}) => onSuccess(res.rows[0]))
		.catch(onFailure)
	}

	static getUserSubmissions(userID : string, onSuccess : Function, onFailure : Function) {
		pool.query("SELECT * FROM \"Submissions\", WHERE userID=$1",[userID])
		.then((res : {rows:Submission[]}) => onSuccess(res.rows))
		.catch(onFailure)
	}
}