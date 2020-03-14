import { CourseInvite, convertCourseInvite } from "../../../models/database/CourseInvites";
import { UUIDHelper } from "../helpers/UUIDHelper";
import { pool, extract, map, checkAvailable, one, pgDB } from "./HelperDB";

/**
 * inviteID, userID, courseID, type, joinRole
 */
export class CourseInviteDB {
	static async filterInvite(invite : CourseInvite){
		const {
			inviteID = undefined,
			creatorID = undefined,
			courseID = undefined,
			type = undefined,
			joinRole = undefined,

			limit = undefined,
			offset = undefined,
			client = pool
		} = invite	
		const 
			inviteid = UUIDHelper.toUUID(inviteID),
			creatorid = UUIDHelper.toUUID(creatorID),
			courseid = UUIDHelper.toUUID(courseID)
		return client.query(`
			SELECT * 
			FROM "CourseInvites"
			WHERE
				($1::uuid IS NULL OR inviteID=$1)
			AND ($2::uuid IS NULL OR creatorID=$2)
			AND ($3::uuid IS NULL OR courseID=$3)
			AND ($4::text IS NULL OR type=$4)
			AND ($5::text IS NULL OR joinRole=$5)
			LIMIT $6
			OFFSET $7
		`, [inviteid, creatorid, courseid, type, joinRole, limit, offset])
		.then(extract).then(map(convertCourseInvite))
	}
	static async addInvite(invite : CourseInvite){
		checkAvailable(['creatorID', 'courseID', 'type', 'joinRole'], invite)
		const {
			creatorID,
			courseID,
			type,
			joinRole,
			client = pool,
		} = invite
		const 
			creatorid = UUIDHelper.toUUID(creatorID),
			courseid = UUIDHelper.toUUID(courseID)
		return client.query(`
		INSERT INTO "CourseInvites" 
		VALUES (DEFAULT, $1,$2, $3, $4)
		RETURNING *
		`, [creatorid, courseid, type, joinRole])
		.then(extract).then(map(convertCourseInvite)).then(one)
	}
	static async deleteInvite(inviteID : string, client : pgDB = pool){
		const inviteid = UUIDHelper.toUUID(inviteID)
		return client.query(`
		DELETE FROM "CourseInvites"
		WHERE inviteID = $1
		RETURNING *
		`, [inviteid])
		.then(extract).then(map(convertCourseInvite)).then(one)
	}

}