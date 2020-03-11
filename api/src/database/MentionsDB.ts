import { pool, DBTools, extract, map, one, checkAvailable } from "./HelperDB"
import { UUIDHelper } from "../helpers/UUIDHelper";
import { convertMention, Mention, mentionToAPI } from "../../../models/database/Mention";
import { commentsView, MentionsView } from "./makeDB";

export class MentionsDB {
	static async getAllMentions(params : DBTools = {}){
		return MentionsDB.filterMentions(params);
	}

	static async getMentionsByUser(userID : string, params : DBTools = {}) {
		return this.filterMentions({...params, userID})
	}

	static async getMentionsByComment(commentID : string, params : DBTools = {}){
		return this.filterMentions({...params, commentID})
	}
	static async getMentionByID(mentionID : string, params :DBTools = {}){
		return this.filterMentions({...params, mentionID}).then(one)
	}

	static async filterMentions(mention : Mention){
		const {
			mentionID = undefined,
			userID = undefined,
			commentID = undefined,
			limit = undefined,
			offset = undefined,
			commentThreadID = undefined,
			submissionID = undefined,
			courseID = undefined,
			client = pool
		} = mention
		const mentionid = UUIDHelper.toUUID(mentionID),
			userid = UUIDHelper.toUUID(userID),
			commentid = UUIDHelper.toUUID(commentID),
			commentthreadid = UUIDHelper.toUUID(commentThreadID),
			submissionid = UUIDHelper.toUUID(submissionID),
			courseid = UUIDHelper.toUUID(courseID)

		return client.query(`
			SELECT *
			FROM "MentionsView"
			WHERE 
				($1::uuid IS NULL OR mentionID = $1)
			AND ($2::uuid IS NULL OR userID = $2)
			AND ($3::uuid IS NULL OR commentID = $3)
			AND ($4::uuid IS NULL OR commentThreadID = $4)
			AND ($5::uuid IS NULL OR submissionID = $5)
			AND ($6::uuid IS NULL OR courseID = $6)
			ORDER BY mentionID
			LIMIT $7
			OFFSET $8
		`, [mentionid, userid, commentid, commentthreadid, submissionid, courseid, limit, offset])
		.then(extract).then(map(convertMention))	
	}
	static async addMention(mention : Mention){
		checkAvailable(['userID', "commentID"], mention)
		const {
			userID,
			commentID,
			client = pool
		} = mention
		const userid = UUIDHelper.toUUID(userID),
			commentid = UUIDHelper.toUUID(commentID)
		return client.query(`
		WITH insert AS (
			INSERT INTO "Mentions"
			VALUES (DEFAULT, $1, $2)
			RETURNING *
		)
		${commentsView('insert')}
		`,[userid, commentid])
		.then(extract).then(map(mentionToAPI)).then(one)
	}

	static async updateMention(mention : Mention){
		checkAvailable(["mentionID"], mention)
		const {
			mentionID,
			client = pool
		} = mention 
		const mentionid = UUIDHelper.toUUID(mentionID)
		return client.query(`
		with update AS (
			UPDATE "Mentions" SET
			userID = COALESCE($2, userID)
			commentID = COALESCE($3, commentID)
			WHERE mentionID = $1
			RETURNING *
		)
		${MentionsView("update")}
		`).then(extract).then(map(mentionToAPI)).then(one)
	}
	/**
	 * mentions are automatically deleted when their comment or user vanishes.
	 * 
	 */
	static async deleteMention(mention : Mention){
		checkAvailable(['mentionID'], mention)
		const {
			mentionID,
			client = pool
		} = mention
		const mentionid = UUIDHelper.toUUID(mentionID)
		return client.query(`
		WITH delete AS (
			DELETE FROM "Mentions"
			WHERE mentionID = $1
			RETURNING *
		)
		${MentionsView('delete')}
		`, [mentionid])
	}
}