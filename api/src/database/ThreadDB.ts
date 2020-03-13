import {pool, extract, map, one, pgDB, funmap, checkAvailable, keyInMap, DBTools } from "./HelperDB";
import {Thread, DBThread, convertThread, APIThread, threadToAPI} from '../../../models/database/Thread';
import {submissionStatus, checkEnum} from '../../../enums/submissionStatusEnum'
import { Comment, convertComment, APIComment } from "../../../models/database/Comment";
import { UUIDHelper } from "../helpers/UUIDHelper";
import { CommentDB } from "./CommentDB";
import { Snippet } from "../../../models/database/Snippet";
import { File } from "../../../models/database/File";
import { AssertionError } from "assert";
import { FileDB } from "./FileDB";
import { commentThreadView } from "./ViewsDB";

/**
 * commentThreadID, submissionID, fileID, snippetID, visibilityState
 * @Author Rens Leendertz
 */

export class ThreadDB {

	static async filterThreadExtended(filterObj : Thread & Snippet & File) {// : Promise<Thread[]> {
		const {
			//ids
			commentThreadID= undefined, 
			submissionID = undefined,
			courseID = undefined,
			fileID = undefined, 
			snippetID = undefined, 
			//thread-specific
			visibilityState = undefined,
			addComments = false,
			//snippet-specific
			lineStart = undefined,
			lineEnd = undefined,
			charStart = undefined,
			charEnd = undefined,
			body = undefined,
			//file-specific
			pathname = undefined,
			type = undefined,
			//extra params
			limit = undefined,
			offset = undefined,
			client = pool
		} = filterObj
		const commentThreadid = UUIDHelper.toUUID(commentThreadID),
			submissionid = UUIDHelper.toUUID(submissionID),
			fileid = UUIDHelper.toUUID(fileID),
			snippetid = UUIDHelper.toUUID(snippetID),
			courseid = UUIDHelper.toUUID(courseID)

		const query =  client.query(`SELECT * FROM "CommentThreadView"
			WHERE 
				($1::uuid IS NULL OR commentThreadID = $1)
			AND ($2::uuid IS NULL OR submissionID = $2)
			AND ($3::uuid IS NULL OR courseID = $3)
			AND ($4::uuid IS NULL OR fileID = $4)
			AND ($5::uuid IS NULL OR snippetID = $5)
			--thread
			AND ($6::text IS NULL OR visibilityState = $6)
			--file
			AND ($7::text IS NULL OR pathname ILIKE $7)
			AND ($8::text IS NULL OR type ILIKE $8)
			--snippet
			AND ($9::text IS NULL OR body ILIKE $9)
			AND ($10::integer IS NULL OR lineStart = $10)
			AND ($11::integer IS NULL OR lineEnd = $11)
			AND ($12::integer IS NULL OR charStart = $12)
			AND ($13::integer IS NULL OR charEnd = $13)

			ORDER BY commentThreadID -- make sure it is always ordered the same
			LIMIT $14
			OFFSET $15
				`, [
					//ids
					commentThreadid,
					submissionid, 
					courseid, 
					fileid,  
					snippetid, 
					//thread
					visibilityState,
					//file
					pathname,
					type,
					//snippet
					body,
					lineStart,
					lineEnd,
					charStart,
					charEnd,
					//extra params
					limit,
					offset
				])
		.then(extract).then(map(threadToAPI))

		if (addComments){
			return ThreadDB.addComments(query, client);
		} else {
			return query;
		}
	}


	static async addCommentSingle(firstQuery : Promise<APIThread>, client : pgDB = pool) : Promise<APIThread>{
		//receive first result, modify it to accomodate for comments.
		const res : APIThread = {...(await firstQuery), comments:[]}
		//retrieve the threadID we need comments for
		const ID = res.ID
		//request comments from database
		const comments = await CommentDB.APIgetCommentsByThreads([(ID)], client)
		//make sure each comment is valid
		//since these are all comments for one thread, we simply assign it.
		if (!(ID in comments)){
			throw new Error("concurrentModificationException")
		}
		res.comments=comments[ID];
		return res;
	}
	static async addComments(firstQuery : Promise<APIThread[]>, client : pgDB = pool) : Promise<APIThread[]>{
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
		const ids = res.map((el : APIThread) => el.ID)
		//query database
		const comments = await CommentDB.APIgetCommentsByThreads(ids, client)
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

	static async getAllThreads(params : DBTools = {}) : Promise<APIThread[]> {
		return ThreadDB.filterThread(params)
	}

	static async getThreadByID(commentThreadID : string, params : DBTools = {}) : Promise<APIThread> {
		return ThreadDB.filterThread({...params, commentThreadID}).then(one)
	}

	static async getThreadsBySubmission(submissionID : string, params : DBTools = {}) : Promise<APIThread[]> {
		return ThreadDB.filterThread({...params, submissionID})
	}

	static async getThreadsByFile(fileID : string, params : DBTools = {}) : Promise<APIThread[]> {
		return ThreadDB.filterThread({...params, fileID})
	}

	static async filterThread(thread : Thread) : Promise<APIThread[]> {
		return ThreadDB.filterThreadExtended(thread);
	}

	static async addThread(thread : Thread) : Promise<APIThread> {
		checkAvailable(['submissionID', 'fileID', 'snippetID','visibilityState'], thread)
		const {
			submissionID, 
			fileID, 
			snippetID, 
			visibilityState,

			addComments = false,

			client = pool
		} = thread
		const submissionid = UUIDHelper.toUUID(submissionID),
			fileid = UUIDHelper.toUUID(fileID),
			snippetid = UUIDHelper.toUUID(snippetID);
		const query = client.query(`
		WITH insert AS (
			INSERT INTO "CommentThread" 
			VALUES (DEFAULT, $1, $2, $3, $4) 
			RETURNING *
		)
		${commentThreadView('insert')}
			`, [submissionid, fileid, snippetid, visibilityState])
		.then(extract).then(map(threadToAPI)).then(one)
		if (addComments){
			return ThreadDB.addCommentSingle(query, client)
		} else {
			return query;
		}
	}
	

	static async updateThread(thread : Thread) {
		checkAvailable(['commentThreadID'], thread)
		const {
			commentThreadID, 
			submissionID = undefined, 
			fileID = undefined, 
			snippetID = undefined, 
			visibilityState = undefined,

			addComments = false,

			client = pool
		} = thread
		const commentThreadid = UUIDHelper.toUUID(commentThreadID),
			submissionid = UUIDHelper.toUUID(submissionID),
			fileid = UUIDHelper.toUUID(fileID),
			snippetid = UUIDHelper.toUUID(snippetID)
		const query =  client.query(`
		WITH update AS (
			UPDATE "CommentThread" SET
			submissionID = COALESCE($2, submissionID),
			fileID = COALESCE($3, fileID),
			snippetID = COALESCE($4, snippetID),
			visibilityState = COALESCE($5, visibilityState)
			WHERE commentThreadID = $1
			RETURNING *
		)
		${commentThreadView('update')}
		`, [commentThreadid, submissionid, fileid, snippetid, visibilityState])
		.then(extract).then(map(threadToAPI)).then(one)

		if (addComments){
			return ThreadDB.addCommentSingle(query, client)
		} else {
			return query
		}

	}
	/**
	 * This delete will bring down all comments and with this thread.
	 * After this call is made, the copmments can no longer be retrieved, except the snippet
	 * though the snippet and file are still send back.
	 * @param commentThreadID 
	 * @param client 
	 */
	static async deleteThread(commentThreadID : string, client : pgDB = pool) {
		const commentThreadid = UUIDHelper.toUUID(commentThreadID)
		return client.query(`
		WITH delete AS (
			DELETE FROM "CommentThread" 
			WHERE commentThreadID = $1
			RETURNING *
		)
		${commentThreadView('delete')}
		`, [commentThreadid])
		.then(extract).then(map(convertThread)).then(one)
	}
	
}
/*
pool.query(`
SELECT * FROM "SnippetsView" where snippetID = (
	DELETE FROM "CommentThread" 
	WHERE commentThreadID = $1 
	RETURNING snippetID
)`,['41a6340a-7465-420f-83a9-1227cf6f1640',]).then(res=>console.log(res.rows)).catch(console.error)


    
    
    '5193250c-b69b-4b48-9ca6-2aab4f52e1fe',
    '8f94e215-d610-401a-9c35-43b61b0089a0',
    '9463450f-78c3-4df2-bd68-de3f97e5cfb6',
    '7fce2c67-fb9f-4033-84c7-2753b0fa66c0',
*/
