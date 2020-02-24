import {pool, extract, map, one, pgDB } from "./HelperDB";
import {Snippet, DBSnippet, convertSnippet} from '../../../models/database/Snippet';

/**
 * 
 * @Author Rens Leendertz
 */
export class SnippetDB {
	static getAllSnippets(DB : pgDB = pool){
		return SnippetDB.filterSnippet({})
	}
	
	static getSnippetsByFile(fileID : string, DB : pgDB = pool){
		return SnippetDB.filterSnippet({fileID})
	}
	
	static getSnippetByID(snippetID : string, DB : pgDB = pool) {
		return SnippetDB.filterSnippet({snippetID}).then(one)
	}

	static filterSnippet(snippet : Snippet, DB : pgDB = pool){
		const {
			snippetID = undefined,
			lineStart = undefined,
			lineEnd = undefined,
			charStart = undefined,
			charEnd = undefined,
			fileID = undefined
		} = snippet
		return DB.query(`SELECT * FROM "Snippets" 
			WHERE
				($1::uuid IS NULL OR snippetID=$1)
			AND ($2::integer IS NULL OR lineStart=$2)
			AND ($3::integer IS NULL OR lineEnd=$3)
			AND ($4::integer IS NULL OR charStart=$4)
			AND ($5::integer IS NULL OR charEnd=$5)
			AND ($6::uuid IS NULL OR fileID=$6)
			`,[snippetID, lineStart, lineEnd, charStart, charEnd, fileID])
		.then(extract).then(map(convertSnippet))
	}

	static addSnippet(snippet : Snippet, DB : pgDB = pool){
		const {
			lineStart,
			lineEnd,
			charStart,
			charEnd,
			fileID
		} = snippet
		return DB.query(`INSERT INTO "Snippets" 
			VALUES (DEFAULT, $1, $2, $3, $4, $5) 
			RETURNING *`, [lineStart, lineEnd, charStart, charEnd,fileID])
		.then(extract).then(map(convertSnippet)).then(one)
	}

	static updateSnippet(snippet : Snippet, DB : pgDB = pool){
		const {
			snippetID,
			lineStart = undefined,
			lineEnd = undefined,
			charStart = undefined,
			charEnd = undefined,
			fileID = undefined
		} = snippet
		return DB.query(`UPDATE "Snippets" SET 
			lineStart = COALESCE($2, lineStart),
			lineEnd = COALESCE($3, lineEnd),
			charStart = COALESCE($4, charStart),
			charEnd = COALESCE($5, charEnd),
			fileID = COALESCE($6, fileID)
			WHERE snippetID=$1
			RETURNING *`, [snippetID, lineStart, lineEnd, charStart, charEnd, fileID])
		.then(extract).then(map(convertSnippet)).then(one)
	}

	static deleteSnippet(snippetID : string, DB : pgDB = pool){
		return DB.query(`DELETE FROM "Snippets" 
			WHERE snippetID = $1 
			RETURNING *`, [snippetID])
		.then(extract).then(map(convertSnippet)).then(one)
	}
}