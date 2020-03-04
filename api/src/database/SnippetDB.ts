import {pool, extract, map, one, pgDB, checkAvailable, DBTools, searchify } from "./HelperDB";
import {Snippet, snippetToAPI, convertSnippet} from '../../../models/database/Snippet';
import { UUIDHelper } from "../helpers/UUIDHelper";

/**
 * 
 * @Author Rens Leendertz
 */
export class SnippetDB {
	static async getAllSnippets(params : DBTools = {}){
		return SnippetDB.filterSnippet(params)
	}
	
	static async getSnippetsByFile(fileID : string, params : DBTools ={}){
		return SnippetDB.filterSnippet({...params, fileID})
	}
	
	static async getSnippetByID(snippetID : string, params : DBTools = {}) {
		return SnippetDB.filterSnippet({...params, snippetID}).then(one)
	}

	static async filterSnippet(snippet : Snippet){
		const {
			snippetID = undefined,
			commentThreadID = undefined,
			submissionID = undefined,
			courseID = undefined,
			fileID = undefined,
			lineStart = undefined,
			lineEnd = undefined,
			charStart = undefined,
			charEnd = undefined,
			body = undefined,
			limit = undefined,
			offset = undefined,
			client = pool
		} = snippet
		const snippetid = UUIDHelper.toUUID(snippetID),
			fileid = UUIDHelper.toUUID(fileID),
			commentthreadid = UUIDHelper.toUUID(commentThreadID),
			submissionid = UUIDHelper.toUUID(submissionID),
			courseid = UUIDHelper.toUUID(courseID),
			searchBody = searchify(body)

		return client.query(
			`SELECT * FROM "SnippetsView" 
			WHERE
				($1::uuid IS NULL OR snippetID=$1)
			AND ($2::uuid IS NULL OR fileID=$2)
			AND ($3::uuid IS NULL OR commentThreadID=$3)
			AND ($4::uuid IS NULL OR submissionID=$4)
			AND ($5::uuid IS NULL OR courseID=$5)
			AND ($6::integer IS NULL OR lineStart=$6)
			AND ($7::integer IS NULL OR lineEnd=$7)
			AND ($8::integer IS NULL OR charStart=$8)
			AND ($9::integer IS NULL OR charEnd=$9)
			AND ($10::text IS NULL OR  body ILIKE $10)
			ORDER BY snippetID
			LIMIT $11
			OFFSET $12
			`,[snippetid, fileid, commentthreadid, submissionid, courseid, 
				lineStart, lineEnd, charStart, charEnd, searchBody, limit, offset ])
		.then(extract).then(map(snippetToAPI))
	}

	static async createNullSnippet(params : DBTools = {}){
		const {client =pool} = params
		return client.query(`
		INSERT INTO "Snippets"
		VALUES (DEFAULT, -1, -1, -1, -1, '') 
		RETURNING *
		`).then(extract).then(one).then(convertSnippet).then(res => res.snippetID)
	}

	static async addSnippet(snippet : Snippet) : Promise<string>{
		// console.log("this function only adds a single snippet. you might want to use a function that also makes the thread immediately.")
		checkAvailable(['lineStart','lineEnd','charStart','charEnd', 'body'], snippet)
		const {
			lineStart,
			lineEnd,
			charStart,
			charEnd,
			body,
			client =pool
		} = snippet
		return client.query(`
			INSERT INTO "Snippets"
			VALUES (DEFAULT, $1, $2, $3, $4, $5) 
			RETURNING snippetID
			`, [lineStart, lineEnd, charStart, charEnd, body])
		.then(extract).then(one).then(res => UUIDHelper.fromUUID(res.snippetid as string))
	}
	

	static async updateSnippet(snippet : Snippet, DB : pgDB = pool){
		checkAvailable(['snippetID'], snippet)
		const {
			snippetID,
			lineStart = undefined,
			lineEnd = undefined,
			charStart = undefined,
			charEnd = undefined,
			body = undefined
		} = snippet
		const snippetid = UUIDHelper.toUUID(snippetID);
		return DB.query(`
			WITH update AS (
				UPDATE "Snippets" SET 
				lineStart = COALESCE($2, lineStart),
				lineEnd = COALESCE($3, lineEnd),
				charStart = COALESCE($4, charStart),
				charEnd = COALESCE($5, charEnd),
				body = COALESCE($6, body)
				WHERE snippetID=$1
				RETURNING *
			)
			SELECT s.*, fv.*, ctr.commentThreadID
			FROM update as s, "CommentThreadRefs" as ctr, "FilesView" as fv
			WHERE ctr.snippetID = s.snippetID
			  AND fv.fileID = ctr.fileID
			`, [snippetid, lineStart, lineEnd, charStart, charEnd, body])
		.then(extract).then(map(snippetToAPI)).then(one)
	}

	static async deleteSnippet(snippetID : string, client : pgDB = pool){
		const snippetid = UUIDHelper.toUUID(snippetID);
		return client.query(`
		DELETE FROM "Snippets" 
		WHERE snippetID = $1 
		RETURNING *
		`, [snippetid])
		.then(extract).then(map(convertSnippet)).then(one)
	}
}