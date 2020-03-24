import { pool, DBTools, extract, map, one, checkAvailable } from "./HelperDB"
import { UUIDHelper } from "../helpers/UUIDHelper";
import { convertMention, Mention, mentionToAPI } from "../../../models/database/Mention";
import { MentionsView } from "./ViewsDB";
import { MissingFieldDatabaseError } from "./DatabaseErrors";

export class MentionsDB {
	static async getMentionsUserCourse(){
		
	}

	static async getAllMentions(params : DBTools = {}){
		return MentionsDB.filterMentions(params);
	}

	static async getMentionsByUser(userID : string, courseID? : string, params : DBTools = {}) {
        const { client = pool, limit = undefined, offset = undefined } = params;
        const userid = UUIDHelper.toUUID(userID),
            courseid = UUIDHelper.toUUID(courseID);
        return client.query(`
            SELECT m.*
            FROM "MentionsView" as m
            WHERE ($2::uuid IS NULL OR m.courseID = $2)
            AND (m.userID = $1
                OR (m.userID IS NULL 
                    AND EXISTS (
                        SELECT * 
                        FROM "CourseRegistration" as cr 
                        WHERE cr.userID = $1 
                        AND cr.courseID = m.courseID 
                        AND cr.courseRole = m.userGroup
                    )
                )
            ) ORDER BY m.created DESC LIMIT $3 OFFSET $4
        `, [userid, courseid, limit, offset])
        .then(extract).then(map(mentionToAPI))
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
            mentionGroup = undefined,
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
            AND ($7::text IS NULL OR userGroup = $7)
			ORDER BY created DESC
			LIMIT $8
			OFFSET $9
		`, [mentionid, userid, commentid, commentthreadid, submissionid, courseid, mentionGroup, limit, offset])
		.then(extract).then(map(mentionToAPI))
	}
	static async addMention(mention : Mention){
        checkAvailable(["commentID"], mention);
        if (!mention.userID && !mention.mentionGroup) {
            throw new MissingFieldDatabaseError("Mention requires either a userID or a mentionGroup");
        }
		const {
			userID,
            commentID,
            mentionGroup,
			client = pool
		} = mention
		const userid = UUIDHelper.toUUID(userID),
			commentid = UUIDHelper.toUUID(commentID)
		return client.query(`
		WITH insert AS (
			INSERT INTO "Mentions"
			VALUES (DEFAULT, $1, $2, $3)
			RETURNING *
		)
		${MentionsView('insert')}
		`,[commentid, userid, mentionGroup])
		.then(extract).then(map(mentionToAPI)).then(one)
	}

	static async updateMention(mention : Mention){
		checkAvailable(["mentionID"], mention)
		const {
			mentionID,
			commentID,
			userID,
			client = pool
		} = mention 
		const mentionid = UUIDHelper.toUUID(mentionID),
			commentid = UUIDHelper.toUUID(commentID),
			userid = UUIDHelper.toUUID(userID)
		return client.query(`
		with update AS (
			UPDATE "Mentions" SET
			userID = COALESCE($2, userID),
			commentID = COALESCE($3, commentID)
			WHERE mentionID = $1
			RETURNING *
		)
		${MentionsView("update")}
		`, [mentionid, userid, commentid])
		.then(extract).then(map(mentionToAPI)).then(one)
	}
	/**
	 * mentions are automatically deleted when their comment or user vanishes.
	 * 
	 */
	static async deleteMention(mentionID : string, params : DBTools = {}){
		const {
			client = pool
		} = params
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