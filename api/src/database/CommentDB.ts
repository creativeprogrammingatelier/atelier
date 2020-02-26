import {pool, extract, map, funmap2, one, searchify, checkAvailable, pgDB, keyInMap } from "./HelperDB";

import {Comment, DBComment, convertComment, onlyComment, APIComment, commentToAPI} from '../../../models/database/Comment';
import { convertThread, Thread} from "../../../models/database/Thread";
import { UUIDHelper } from "../helpers/UUIDHelper";

// import RolePermissionHelper from './RolePermissionsHelper'
/**
 * commentID, commentThreadID, userID, date, body
 * @Author Rens Leendertz
 */

export class CommentDB {
	static async APIgetCommentsByThreads(ids : string[], DB : pgDB = pool) {
		//This mapping is a map of key=> comment[]. this is fine
		// tslint:disable-next-line: no-any
		const mapping : any = {}
		ids.forEach(element => {
			mapping[element]=[]
		});

		const comments = await DB.query(`SELECT * 
			FROM "Comments" 
			WHERE commentThreadID = ANY($1)
			`, [ids])
			.then(extract).then(map(commentToAPI))
		comments.forEach(element => {
			if (keyInMap(element.references.commentThreadID, mapping)){
				mapping[element.references.commentThreadID].push(element)
			} else {
				throw new Error("database concurrent modification exception")
			}
		})
		return mapping
	}



	/**
	 * all functions below are for a this table only 
	 */
	static async getAllComments(limit? :number, DB : pgDB = pool){
		return CommentDB.filterComment({}, limit, DB)
	}
	static async getCommentsByThread(commentThreadID : string, limit ? : number, DB : pgDB = pool){
		return CommentDB.filterComment({commentThreadID},limit, DB)
	}
	static async getCommentByID(commentID : string, DB : pgDB = pool){
		return CommentDB.filterComment({commentID}, 1, DB).then(one)
	}
	static async filterComment(comment : Comment, limit : number | undefined, DB : pgDB = pool) {
		const {
			commentID = undefined,
			commentThreadID = undefined, 
			userID = undefined, 
			date = undefined, 
			body = undefined
		} = comment
		const commentid = UUIDHelper.toUUID(commentID), 
			commentthreadid = UUIDHelper.toUUID(commentThreadID)
		if (limit && limit < 0) limit = undefined
		return DB.query(`SELECT * FROM "Comments" 
			WHERE
				($1::uuid IS NULL OR commentID=$1)
			AND ($2::uuid IS NULL OR commentThreadID=$2)
			AND ($3::uuid IS NULL OR userID=$3)
			AND ($4::timestamp IS NULL OR date=$4)
			AND ($5::text IS NULL OR body=$5)
			LIMIT $6
			`,[commentid, commentthreadid, userID, date, body, limit])
		.then(extract).then(map(convertComment))
	}

	static async textSearch(searchString : string, limit ?: number, DB : pgDB=pool){
		//escape special characters, allow us to search somewhere in the string instead of the whole
		searchString = searchify(searchString)
		if (limit === undefined || limit<0)limit=undefined
		//query the comments database. union with commentThread for info
		const response = await DB.query(`SELECT *
			FROM "Comments" as c, "CommentThread" as t
			WHERE body ILIKE $1 AND c.commentThreadID = t.commentThreadID
			LIMIT $2`, [searchString, limit])
			//map2 runs both conversions, giving back one object.
			.then(extract).then(funmap2(convertComment, convertThread))
		//define mapping to use the common uuid to sort
		const mapping = new Map<string, ExtendedThread>();
		//result will be the thing we give back
		const result : ExtendedThread[] = []
		//for each matching comment
		response.forEach((element : Comment & Thread) => {
			//if comment is in a new thread...
			if (!(mapping.has(element.commentThreadID!))){
				//create that (extended) thread
				const thread = onlyThread(element)
				//make a mapping for this item
				mapping.set(element.commentThreadID!, thread)
				//store it in the result array as well
				result.push(thread)
			}
			//now we know that the corresponding thread exists, in the mapping,
			//we simply add the Comment to the comments[] of the ExtendedThread
			mapping.get(element.commentThreadID!)!.comments.push(onlyComment(element));
		})

		return result
	}


	static async addComment(comment : Comment, DB : pgDB = pool){
		checkAvailable(['commentThreadID', 'userID', 'body'], comment)
		const {
			commentThreadID, 
			userID, 
			date=new Date(), 
			body
		} = comment
		const commentThreadid = UUIDHelper.toUUID(commentThreadID),
			userid = UUIDHelper.toUUID(userID);
		return DB.query(`INSERT INTO "Comments" 
			VALUES (DEFAULT, $1,$2,$3,$4) 
			RETURNING *`, [commentThreadid,userid,date,body])
		.then(extract).then(map(convertComment)).then(one)
	}
	static async updateComment(comment : Comment, DB : pgDB = pool){
		checkAvailable(['commentID'], comment)
		const {
			commentID,
			commentThreadID = undefined, 
			userID = undefined, 
			date = undefined, 
			body = undefined
		} = comment
		const commentid = UUIDHelper.toUUID(commentID),
			commentThreadid = UUIDHelper.toUUID(commentThreadID),
			userid = UUIDHelper.toUUID(userID);
		return DB.query(`UPDATE "Comments" SET 
			commentThreadID = COALESCE($2, commentThreadID),
			userID = COALESCE($3,userID),
			date = COALESCE($4, date),
			body = COALESCE($5, body)
			WHERE commentID =$1
			RETURNING *`, [commentid, commentThreadid, userid, date, body])
		.then(extract).then(map(convertComment)).then(one)
	}
	static async deleteComment(commentID : string, DB : pgDB = pool){
		const commentid = UUIDHelper.toUUID(commentID);
		return DB.query(`DELETE FROM "Comments" 
			WHERE commentID=$1
			RETURNING *`, [commentid])
		.then(extract).then(map(convertComment)).then(one)
	}
}
