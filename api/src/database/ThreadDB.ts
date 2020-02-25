import {pool, extract, map, one, pgDB, funmap, checkAvailable } from "./HelperDB";
import {Thread, DBThread, ExtendedThread, convertThread} from '../../../models/database/Thread';
import {submissionStatus, checkEnum} from '../../../enums/submissionStatusEnum'
import { Comment, convertComment } from "../../../models/database/Comment";
import { UUIDHelper } from "../helpers/UUIDHelper";

/**
 * commentThreadID, submissionID, fileID, snippetID, visibilityState
 * @Author Rens Leendertz
 */

export class ThreadDB {
	static async getAllThreads(DB : pgDB = pool) : Promise<Thread[]> {
		return ThreadDB.getThreadsLimit(undefined)
	}

	static async getThreadsLimit(limit : number | undefined, DB : pgDB = pool) : Promise<Thread[]>{
		return ThreadDB.filterThread({}, limit)
	}

	static async getThreadByID(commentThreadID : string, DB : pgDB = pool) : Promise<Thread> {
		return ThreadDB.filterThread({commentThreadID}, 1).then(one)
	}

	static async getThreadsBySubmission(submissionID : string, DB : pgDB = pool) : Promise<Thread[]> {
		return ThreadDB.filterThread({submissionID}, undefined)
	}

	static async getThreadsByFile(fileID : string, DB : pgDB = pool) : Promise<Thread[]> {
		return ThreadDB.filterThread({fileID}, undefined)
	}

	static async filterThread(thread : Thread, limit : number | undefined, DB : pgDB = pool) : Promise<Thread[]> {
		const {
			commentThreadID = undefined, 
			submissionID = undefined, 
			fileID = undefined, 
			snippetID = undefined, 
			visibilityState = undefined
		} = thread
		const commentThreadid = UUIDHelper.toUUID(commentThreadID),
			submissionid = UUIDHelper.toUUID(submissionID),
			fileid = UUIDHelper.toUUID(fileID),
			snippetid = UUIDHelper.toUUID(snippetID)
		const commentThreadIDPresent = commentThreadid !== undefined,
			submissionIDPresent = submissionid !== undefined,
			filePresent = fileid !== undefined,
			snippetPresent = snippetid !== undefined,
			visibilityStatePresent = visibilityState !==undefined

		if (limit && limit < 0) limit = undefined

		return DB.query(`SELECT * FROM "CommentThread" 
			WHERE
				((NOT $2::bool) OR commentThreadID = $1)
			AND ((NOT $4::bool) OR submissionID = $3)
			AND ((NOT $6::bool) OR fileID = $5)
			AND ((NOT $8::bool) OR snippetID = $7)
			AND ((NOT $10::bool) OR visibilityState = $9)
			LIMIT $11
				`, [commentThreadid, commentThreadIDPresent,
					submissionid, submissionIDPresent,
					fileid, filePresent, 
					snippetid, snippetPresent, 
					visibilityState, visibilityStatePresent,
					limit
				])
		.then(extract).then(map(convertThread))
	}

	static async addThread(thread : Thread, DB : pgDB = pool) : Promise<Thread> {
		checkAvailable(['submissionID', 'fileID', 'snippetID','visibilityState'], thread)
		const {
			// commentThreadID, 
			submissionID, 
			fileID, 
			snippetID, 
			visibilityState
		} = thread
		const submissionid = UUIDHelper.toUUID(submissionID),
			fileid = UUIDHelper.toUUID(fileID),
			snippetid = UUIDHelper.toUUID(snippetID);
		return DB.query(`INSERT INTO "CommentThread" 
			VALUES (DEFAULT, $1, $2, $3, $4) 
			RETURNING *`, [submissionid, fileid, snippetid, visibilityState])
		.then(extract).then(map(convertThread)).then(one)
	}
	static async updateThread(thread : Thread, DB : pgDB = pool) {
		checkAvailable(['commentThreadID'], thread)
		const {
			commentThreadID, 
			submissionID = undefined, 
			fileID = undefined, 
			snippetID = undefined, 
			visibilityState = undefined
		} = thread
		const commentThreadid = UUIDHelper.toUUID(commentThreadID),
			submissionid = UUIDHelper.toUUID(submissionID),
			fileid = UUIDHelper.toUUID(fileID),
			snippetid = UUIDHelper.toUUID(snippetID)
		return DB.query(`UPDATE "CommentThread" SET
			submissionID = COALESCE($2, submissionID),
			fileID = COALESCE($3, fileID),
			snippetID = COALESCE($4, snippetID),
			visibilityState = COALESCE($5, visibilityState)
			WHERE commentThreadID = $1
			RETURNING *`, [commentThreadid, submissionid, fileid, snippetid, visibilityState])
		.then(extract).then(map(convertThread)).then(one)
	}
	static async deleteThread(commentThreadID : string, DB : pgDB = pool) {
		const commentThreadid = UUIDHelper.toUUID(commentThreadID)
		return DB.query(`DELETE FROM "CommentThread" 
			WHERE commentThreadID = $1 
			RETURNING *`, [commentThreadid])
		.then(extract).then(map(convertThread)).then(one)
	}
	static async addCommentSingle(firstQuery : Promise<Thread>, DB : pgDB = pool) : Promise<ExtendedThread>{
		//receive first result, modify it to accomodate for comments.
		const res : ExtendedThread = {...(await firstQuery), comments:[]}
		//retrieve the threadID we need comments for
		const ID = res.commentThreadID!
		const id = UUIDHelper.toUUID(ID)
		//request comments from database
		const comments = await DB.query(`SELECT * 
			FROM "Comments" 
			WHERE commentThreadID = $1`, [id])
		.then(extract).then(map(convertComment))
		//make sure each comment is valid
		comments.forEach(element => {
			if (element.commentThreadID !== ID){
				throw new Error("query is broken")
			}
		})
		//since these are all comments for one thread, we simply assign it.
		res.comments=comments;
		return res;
	}
	static async addComments(firstQuery : Promise<Thread[]>, DB : pgDB = pool) : Promise<ExtendedThread[]>{
		//receive first result, modify the incomming result to be of type ExtendedThread
		const res : ExtendedThread[] = (await firstQuery).map((el : Thread) => ({...el, comments:[]}))
		//create a mapping to later quickly insert comments
		const mapping = new Map<string, ExtendedThread>();
		//fill the map
		res.forEach(element => {
			mapping.set(element.commentThreadID!, element);
		});
		//retrieve the IDS we neeed to get comments for
		const ids = res.map((el : Thread) => UUIDHelper.toUUID(el.commentThreadID!))
		//query database
		const comments = await DB.query(`SELECT * 
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
