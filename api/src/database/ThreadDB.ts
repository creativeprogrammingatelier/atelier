import {pool, extract, map, one, pgDB, funmap, checkAvailable, keyInMap } from "./HelperDB";
import {Thread, DBThread, convertThread, APIThread} from '../../../models/database/Thread';
import {submissionStatus, checkEnum} from '../../../enums/submissionStatusEnum'
import { Comment, convertComment, APIComment } from "../../../models/database/Comment";
import { UUIDHelper } from "../helpers/UUIDHelper";
import { CommentDB } from "./CommentDB";

/**
 * commentThreadID, submissionID, fileID, snippetID, visibilityState
 * @Author Rens Leendertz
 */

export class ThreadDB {

	static async APIfilterThread(thread : Thread, limit : number | undefined, DB : pgDB = pool) : Promise<Thread[]> {
		const {
			commentThreadID= undefined, 
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


	static async addCommentSingle(firstQuery : Promise<APIThread>, DB : pgDB = pool) : Promise<APIThread>{
		//receive first result, modify it to accomodate for comments.
		const res : APIThread = {...(await firstQuery), comments:[]}
		//retrieve the threadID we need comments for
		const ID = res.ID
		const id = UUIDHelper.toUUID(ID)
		//request comments from database
		const comments = await CommentDB.APIgetCommentsByThreads([id], DB)
		//make sure each comment is valid
		//since these are all comments for one thread, we simply assign it.
		if (!(id in comments)){
			throw new Error("concurrentModificationException")
		}
		res.comments=comments.get(id);
		return res;
	}
	private static async addComments(firstQuery : Promise<APIThread[]>, DB : pgDB = pool) : Promise<APIThread[]>{
		//receive first result, modify the incomming result to be of type ExtendedThread
		const res : APIThread[] = (await firstQuery)
		//create a mapping to later quickly insert comments
		// tslint:disable-next-line: no-any
		const mapping : any= {};
		//fill the map
		res.forEach(element => {
			mapping[element.ID] = element;
		});
		//retrieve the IDS we neeed to get comments for
		const ids = res.map((el : Thread) => UUIDHelper.toUUID(el.commentThreadID!))
		//query database
		const comments = await CommentDB.APIgetCommentsByThreads(ids, DB)
		//insert each Comment object at the right commentThread object using the map
		ids.forEach(id  => {
			//sanity checks
			if (keyInMap(id, comments) && keyInMap(id, mapping)){
				mapping[id].comments = comments[id]
			} else {
				throw new Error("the query is broken")
			}
		})
		return res;
	}


	/** all stuff below here is for backend, not api */
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
	
}
