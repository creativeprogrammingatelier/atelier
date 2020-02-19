const HH = require("./HelperHelper")

import {Snippet, DBSnippet, convert} from '../../../models/Snippet';

/**
 * 
 * @Author Rens Leendertz
 */
const {pool, extract, map, one} = HH
export default class SnippetHelper {
	static addSnippet(snippet : Snippet){
		const {
			lineStart,
			lineEnd,
			charStart,
			charEnd,
			fileID
		} = snippet
		return pool.query("INSERT INTO \"Snippets\" VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *", [lineStart, lineEnd, charStart, charEnd,fileID])
		.then(extract).then(map(convert)).then(one)
	}

	static updateSnippet(snippet : Snippet){
		const {
			snippetID,
			lineStart = undefined,
			lineEnd = undefined,
			charStart = undefined,
			charEnd = undefined,
			fileID = undefined
		} = snippet
		return pool.query(`UPDATE \"Snippets\" SET 
			lineStart = COALESCE($2, lineStart),
			lineEnd = COALESCE($3, lineEnd),
			charStart = COALESCE($4, charStart),
			charEnd = COALESCE($5, charEnd),
			fileID = COALESCE($6, fileID),
			WHERE snippetID=$1
			RETURNING *`, [snippetID, lineStart, lineEnd, charStart, charEnd, fileID])
		.then(extract).then(map(convert)).then(one)
	}
}