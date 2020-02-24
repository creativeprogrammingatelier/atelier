import * as HH from "./HelperHelper";

import {Thread, DBThread, convertThread} from '../../../models/Thread';
import {submissionStatus, checkEnum} from '../../../enums/submissionStatusEnum'
import RolePermissionHelper from './RolePermissionsHelper'
/**
 * commentThreadID, submissionID, fileID, snippetID, visibilityState
 * @Author Rens Leendertz
 */
const {query, extract, one, map}= HH

export default class ThreadHelper {
	static getAllThreads() : Promise<Thread[]> {
		return ThreadHelper.getThreadsLimit(undefined)
	}

	static getThreadsLimit(limit : number | undefined) : Promise<Thread[]>{
		return ThreadHelper.filterThread({}, limit)
	}

	static getThreadByID(commentThreadID : string) : Promise<Thread> {
		return ThreadHelper.filterThread({commentThreadID}, 1).then(one)
	}

	static getThreadsBySubmission(submissionID : string) : Promise<Thread[]> {
		return ThreadHelper.filterThread({submissionID}, undefined)
	}

	static getThreadsByFile(fileID : string) : Promise<Thread[]> {
		return ThreadHelper.filterThread({fileID}, undefined)
	}

	static filterThread(thread : Thread, limit : number | undefined) : Promise<Thread[]> {
		const {
			commentThreadID = undefined, 
			submissionID = undefined, 
			fileID = undefined, 
			snippetID = undefined, 
			visibilityState = undefined
		} = thread
		const commentThreadIDPresent = 'commentThreadID' in thread
		const submissionIDPresent = 'submissionID' in thread
		const filePresent = 'fileID' in thread
		const snippetPresent = 'snippetID' in thread
		const visibilityStatePresent = 'visibilityState' in thread

		if (limit && limit < 0) limit = undefined

		return query(`SELECT * FROM \"CommentThread\" 
			WHERE
				((NOT $2::bool) OR commentThreadID = $1)
			AND ((NOT $4::bool) OR submissionID = $3)
			AND ((NOT $6::bool) OR fileID = $5)
			AND ((NOT $8::bool) OR snippetID = $7)
			AND ((NOT $10::bool) OR visibilityState = $9)
			LIMIT $11
				`, [commentThreadID, commentThreadIDPresent,
					submissionID, submissionIDPresent,
					fileID, filePresent, 
					snippetID, snippetPresent, 
					visibilityState, visibilityStatePresent,
					limit
				])
		.then(extract).then(map(convertThread))
	}

	static addThread(thread : Thread) : Promise<Thread> {
		const {
			// commentThreadID, 
			submissionID, 
			fileID, 
			snippetID, 
			visibilityState
		} = thread
		return query(`INSERT INTO \"CommentThread\" VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *`, [submissionID, fileID, snippetID, visibilityState])
		.then(extract).then(map(convertThread)).then(one)
	}
	static updateThread(thread : Thread) {
		const {
			commentThreadID, 
			submissionID = undefined, 
			fileID = undefined, 
			snippetID = undefined, 
			visibilityState = undefined
		} = thread
		return query(`UPDATE \"CommentThread\" SET
			submissionID = COALESCE($2, submissionID),
			fileID = COALESCE($3, fileID),
			snippetID = COALESCE($4, snippetID),
			visibilityState = COALESCE($5, visibilityState)
			WHERE commentThreadID = $1
			RETURNING *`, [commentThreadID, submissionID, fileID, snippetID, visibilityState])
		.then(extract).then(map(convertThread)).then(one)
	}
	static deleteThread(commentThreadID : string) {
		return query<DBThread, [string]>(`DELETE FROM \"CommentThread\" WHERE commentThreadID = $1 RETURNING *`, [commentThreadID])
		.then(extract).then(map(convertThread)).then(one)
	}
}