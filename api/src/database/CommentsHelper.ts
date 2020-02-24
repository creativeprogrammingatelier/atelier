const HH = require("./HelperHelper");

import {Comment, DBComment, convertComment} from '../../../models/Comment';
// import RolePermissionHelper from './RolePermissionsHelper'
/**
 * commentID, commentThreadID, userID, date, body
 * @Author Rens Leendertz
 */
const {query, extract, map, one} = HH;
export default class CommentHelper {
	static getAllComments(limit? :number){
		return CommentHelper.filterComment({}, limit)
	}
	static getCommentsByThread(commentThreadID : string, limit ? : number){
		return CommentHelper.filterComment({commentThreadID},limit)
	}
	static getCommentByID(commentID : string){
		return CommentHelper.filterComment({commentID}, 1).then(one)
	}
	static filterComment(comment : Comment, limit : number | undefined) {
		const {
			commentID = undefined,
			commentThreadID = undefined, 
			userID = undefined, 
			date = undefined, 
			body = undefined
		} = comment
		if (limit && limit < 0) limit = undefined
		return query(`SELECT * FROM \"Comments\" 
			WHERE
				($1::uuid IS NULL OR commentID=$1)
			AND ($2::uuid IS NULL OR commentThreadID=$2)
			AND ($3::uuid IS NULL OR userID=$3)
			AND ($4::timestamp IS NULL OR date=$4)
			AND ($5::text IS NULL OR body=$5)
			LIMIT $6
			`,[commentID, commentThreadID, userID, date, body, limit])
		.then(extract).then(map(convertComment))
	}


	static addComment(comment : Comment){
		const {
			commentThreadID, 
			userID, 
			date=new Date(), 
			body
		} = comment
		return query("INSERT INTO \"Comments\" VALUES (DEFAULT, $1,$2,$3,$4) RETURNING *", [commentThreadID,userID,date,body])
		.then(extract).then(map(convertComment)).then(one)
	}
	static updateComment(comment : Comment){
		const {
			commentID,
			commentThreadID = undefined, 
			userID = undefined, 
			date = undefined, 
			body = undefined
		} = comment
		return query(`UPDATE \"Comments\" SET 
			commentThreadID = COALESCE($2, commentThreadID),
			userID = COALESCE($3,userID),
			date = COALESCE($4, date),
			body = COALESCE($5, body)
			WHERE commentID =$1
			RETURNING *`, [commentID, commentThreadID, userID, date, body])
		.then(extract).then(map(convertComment)).then(one)
	}
	static deleteComment(commentID : string){
		return query("DELETE FROM \"Comments\" WHERE commentID=$1 RETURNING *", [commentID])
		.then(extract).then(map(convertComment)).then(one)
	}
}
