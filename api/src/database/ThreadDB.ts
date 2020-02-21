import {query, extract, map, one} from "./HelperDB";
import {Thread, DBThread, ExtendedThread, convertThread} from '../../../models/Thread';
import {submissionStatus, checkEnum} from '../../../enums/submissionStatusEnum'
import { Comment, convertComment } from "../../../models/Comment";

/**
 * commentThreadID, submissionID, fileID, snippetID, visibilityState
 * @Author Rens Leendertz
 */

export class ThreadDB {
	static getAllThreads() : Promise<Thread[]> {
		return ThreadDB.getThreadsLimit(undefined)
	}

	static getThreadsLimit(limit : number | undefined) : Promise<Thread[]>{
		return ThreadDB.filterThread({}, limit)
	}

	static getThreadByID(commentThreadID : string) : Promise<Thread> {
		return ThreadDB.filterThread({commentThreadID}, 1).then(one)
	}

	static getThreadsBySubmission(submissionID : string) : Promise<Thread[]> {
		return ThreadDB.filterThread({submissionID}, undefined)
	}

	static getThreadsByFile(fileID : string) : Promise<Thread[]> {
		return ThreadDB.filterThread({fileID}, undefined)
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
	static async addCommentSingle(firstQuery : Promise<Thread>) : Promise<ExtendedThread>{
		const res : ExtendedThread = {...(await firstQuery), comments:[]}
		const id = res.commentThreadID!
		const comments = await query("select * from \"Comments\" where commentThreadID = $1", [id])
		.then(extract).then(map(convertComment))
		comments.forEach(element => {
			if (element.commentThreadID !== id){
				throw new Error("query is broken")
			}
		})
		res.comments=comments;
		return res;
	}
	static async addComments(firstQuery : Promise<Thread[]>) : Promise<ExtendedThread[]>{
		const res : ExtendedThread[] = (await firstQuery).map((el : Thread) => ({...el, comments:[]}))
		const mapping = new Map<string, ExtendedThread>();
		res.forEach(element => {
			mapping.set(element.commentThreadID!, element);
		});
		const ids = res.map((el : Thread) => el.commentThreadID!)
		const comments = await query("select * from \"Comments\" where commentThreadID = ANY($1)", [ids])
		.then(extract).then(map(convertComment))
		comments.forEach(element => {
			if (element.commentThreadID !== undefined && (mapping.has(element.commentThreadID))){
				mapping.get(element.commentThreadID)!.comments.push(element)
			} else {
				throw new Error("the query is broken")
			}
		})
		return res;
	}
}

