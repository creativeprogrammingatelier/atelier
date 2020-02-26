import {pool, extract, map, one, pgDB, checkAvailable } from "./HelperDB";
import {Snippet, DBSnippet, convertSnippet} from '../../../models/database/Snippet';
import { UUIDHelper } from "../helpers/UUIDHelper";

/**
 * 
 * @Author Rens Leendertz
 */
export class SnippetDB {
	static async getAllSnippets(DB : pgDB = pool){
		return SnippetDB.filterSnippet({})
	}
	
	static async getSnippetsByFile(fileID : string, DB : pgDB = pool){
		return SnippetDB.filterSnippet({fileID})
	}
	
	static async getSnippetByID(snippetID : string, DB : pgDB = pool) {
		return SnippetDB.filterSnippet({snippetID}).then(one)
	}

	static async filterSnippet(snippet : Snippet, DB : pgDB = pool){
		const {
			snippetID = undefined,
			lineStart = undefined,
			lineEnd = undefined,
			charStart = undefined,
			charEnd = undefined,
			fileID = undefined
		} = snippet
		const snippetid = UUIDHelper.toUUID(snippetID),
			fileid = UUIDHelper.toUUID(fileID);
		return DB.query(`SELECT * FROM "Snippets" 
			WHERE
				($1::uuid IS NULL OR snippetID=$1)
			AND ($2::integer IS NULL OR lineStart=$2)
			AND ($3::integer IS NULL OR lineEnd=$3)
			AND ($4::integer IS NULL OR charStart=$4)
			AND ($5::integer IS NULL OR charEnd=$5)
			AND ($6::uuid IS NULL OR fileID=$6)
			`,[snippetid, lineStart, lineEnd, charStart, charEnd, fileid])
		.then(extract).then(map(convertSnippet))
	}

	static async addSnippet(snippet : Snippet, DB : pgDB = pool){
		checkAvailable(['lineStart','lineEnd','charStart','charEnd','fileID'], snippet)
		const {
			lineStart,
			lineEnd,
			charStart,
			charEnd,
			fileID
		} = snippet
		const fileid = UUIDHelper.toUUID(fileID);
		return DB.query(`INSERT INTO "Snippets" 
			VALUES (DEFAULT, $1, $2, $3, $4, $5) 
			RETURNING *`, [lineStart, lineEnd, charStart, charEnd,fileid])
		.then(extract).then(map(convertSnippet)).then(one)
	}

	static async updateSnippet(snippet : Snippet, DB : pgDB = pool){
		checkAvailable(['snippetID'], snippet)
		const {
			snippetID,
			lineStart = undefined,
			lineEnd = undefined,
			charStart = undefined,
			charEnd = undefined,
			fileID = undefined
		} = snippet
		const snippetid = UUIDHelper.toUUID(snippetID),
			fileid = UUIDHelper.toUUID(fileID);
		return DB.query(`UPDATE "Snippets" SET 
			lineStart = COALESCE($2, lineStart),
			lineEnd = COALESCE($3, lineEnd),
			charStart = COALESCE($4, charStart),
			charEnd = COALESCE($5, charEnd),
			fileID = COALESCE($6, fileID)
			WHERE snippetID=$1
			RETURNING *`, [snippetid, lineStart, lineEnd, charStart, charEnd, fileid])
		.then(extract).then(map(convertSnippet)).then(one)
	}

	static async deleteSnippet(snippetID : string, DB : pgDB = pool){
		const snippetid = UUIDHelper.toUUID(snippetID);
		return DB.query(`DELETE FROM "Snippets" 
			WHERE snippetID = $1 
			RETURNING *`, [snippetid])
		.then(extract).then(map(convertSnippet)).then(one)
	}
}