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

		return query(`SELECT * FROM "CommentThread" 
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
		return query(`INSERT INTO "CommentThread" 
			VALUES (DEFAULT, $1, $2, $3, $4) 
			RETURNING *`, [submissionID, fileID, snippetID, visibilityState])
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
		return query(`UPDATE "CommentThread" SET
			submissionID = COALESCE($2, submissionID),
			fileID = COALESCE($3, fileID),
			snippetID = COALESCE($4, snippetID),
			visibilityState = COALESCE($5, visibilityState)
			WHERE commentThreadID = $1
			RETURNING *`, [commentThreadID, submissionID, fileID, snippetID, visibilityState])
		.then(extract).then(map(convertThread)).then(one)
	}
	static deleteThread(commentThreadID : string) {
		return query(`DELETE FROM "CommentThread" 
			WHERE commentThreadID = $1 
			RETURNING *`, [commentThreadID])
		.then(extract).then(map(convertThread)).then(one)
	}
	static async addCommentSingle(firstQuery : Promise<Thread>) : Promise<ExtendedThread>{
		//receive first result, modify it to accomodate for comments.
		const res : ExtendedThread = {...(await firstQuery), comments:[]}
		//retrieve the threadID we need comments for
		const id = res.commentThreadID!
		//request comments from database
		const comments = await query(`SELECT * 
			FROM "Comments" 
			WHERE commentThreadID = $1`, [id])
		.then(extract).then(map(convertComment))
		//make sure each comment is valid
		comments.forEach(element => {
			if (element.commentThreadID !== id){
				throw new Error("query is broken")
			}
		})
		//since these are all comments for one thread, we simply assign it.
		res.comments=comments;
		return res;
	}
	static async addComments(firstQuery : Promise<Thread[]>) : Promise<ExtendedThread[]>{
		//receive first result, modify the incomming result to be of type ExtendedThread
		const res : ExtendedThread[] = (await firstQuery).map((el : Thread) => ({...el, comments:[]}))
		//create a mapping to later quickly insert comments
		const mapping = new Map<string, ExtendedThread>();
		//fill the map
		res.forEach(element => {
			mapping.set(element.commentThreadID!, element);
		});
		//retrieve the IDS we neeed to get comments for
		const ids = res.map((el : Thread) => el.commentThreadID!)
		//query database
		const comments = await query(`SELECT * 
			FROM "Comments" 
			WHERE commentThreadID = ANY($1)`, [ids])
		.then(extract).then(map(convertComment))
		//insert each Comment object at the right commentThread object using the map
		comments.forEach(element => {
			//sanity checks
			if (element.commentThreadID !== undefined && (mapping.has(element.commentThreadID))){
				mapping.get(element.commentThreadID)!.comments.push(element)
			} else {
				throw new Error("the query is broken")
			}
		})
		return res;
	}
}
