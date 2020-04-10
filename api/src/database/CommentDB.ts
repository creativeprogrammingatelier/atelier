import {pool, extract, map, one, searchify, checkAvailable, pgDB, keyInMap, DBTools, funmap2} from "./HelperDB";
import {Comment, commentToAPI, DBAPIComment} from '../../../models/database/Comment';
import {UUIDHelper} from "../helpers/UUIDHelper";
import {commentsView} from "./ViewsDB";
import {submissionToAPI, DBAPISubmission} from "../../../models/database/Submission";
import {SearchResultComment} from "../../../models/api/SearchResult";

/**
 * commentID, commentThreadID, userID, created, edited, body
 * @Author Rens Leendertz
 */

export class CommentDB {
    //private static userselect = `name, email, globalRole`;
    /**
     *
     * @param ids a list of comment thread IDs to retrieve the comments for
     * @param client optional client object for when performing a transaction.
     * @returns an object, with keys = ids, and values all comments made within that one comment thread.
     */
    static async APIgetCommentsByThreads(ids: string[], client: pgDB = pool) {
        //This mapping is a map of key=> comment[]. this is fine
        // tslint:disable-next-line: no-any
        const mapping: any = {};
        ids.forEach(element => {
            mapping[element] = []
        });
        const arg = [ids.map(UUIDHelper.toUUID)];
        type argType = typeof arg;
        const comments = await client.query<DBAPIComment, argType>(`
			SELECT c.*
			FROM "CommentsView" as c
			WHERE c.commentThreadID = ANY($1)
			`, arg)
            .then(extract).then(map(commentToAPI));

        comments.forEach(element => {
            if (keyInMap(element.references.commentThreadID, mapping)) {
                mapping[element.references.commentThreadID].push(element)
            } else {
                throw new Error("database concurrent modification exception")
            }
        });
        return mapping
    }

    /**
     * all functions below are for a this table only
     */
    static async getAllComments(params: DBTools = {}) {
        return CommentDB.filterComment(params)
    }

    static async getCommentsByThread(commentThreadID: string, params: DBTools = {}) {
        return CommentDB.filterComment({...params, commentThreadID})
    }

    static async getCommentByID(commentID: string, client: pgDB = pool) {
        return CommentDB.filterComment({commentID, client}).then(one)
    }

    /**
     * return a subset of comments that pass the input filter
     *
     * @param comment contains everything to be filtered on.
     *                  supplying a date filter willl return all comments new than that date.
     *                  instead of literal comaprisons of the bodies, the body text will be searched
     *                  'limit' and 'offset' fields allow to manipulate the number of results
     *                  the results are sorted by date, newest first
     */
    static async filterComment(comment: Comment) {
        const {
            commentID = undefined,
            commentThreadID = undefined,
            submissionID = undefined,
            courseID = undefined,
            userID = undefined,
            created = undefined,
            edited = undefined,
            body = undefined,
            limit = undefined,
            offset = undefined,
            client = pool
        } = comment;
        const commentid = UUIDHelper.toUUID(commentID),
            commentthreadid = UUIDHelper.toUUID(commentThreadID),
            submissionid = UUIDHelper.toUUID(submissionID),
            courseid = UUIDHelper.toUUID(courseID),
            userid = UUIDHelper.toUUID(userID),
            bodysearch = searchify(body);

        const args = [commentid, commentthreadid, submissionid, courseid, userid,
            created, edited, bodysearch, limit, offset];
        type argType = typeof args;
        return client.query<DBAPIComment, argType>(`
			SELECT c.*
			FROM "CommentsView" as c
			WHERE
				($1::uuid IS NULL OR commentID=$1)
			AND ($2::uuid IS NULL OR commentThreadID=$2)
			AND ($3::uuid IS NULL OR submissionID=$3)
			AND ($4::uuid IS NULL OR courseID=$4)
			AND ($5::uuid IS NULL OR userID=$5)
			AND ($6::timestamp IS NULL OR created >= $6)
			AND ($7::timestamp IS NULL OR edited >= $7)
			AND ($8::text IS NULL OR body ILIKE $8)
			ORDER BY created DESC, commentID --unique in case 2 comments same time
			LIMIT $9
			OFFSET $10
			`, args)
            .then(extract).then(map(commentToAPI))
    }

    /**
     *
     * @param searchString string to search for
     * @param extras
     * if a body is provided in extras, this will overwrite the searchstring.
     */
    static async searchComments(searchString: string, extras: Comment): Promise<SearchResultComment[]> {
        checkAvailable(['currentUserID', 'courseID'], extras);
        console.log(extras);
        const {
            commentID = undefined,
            commentThreadID = undefined,
            submissionID = undefined,
            courseID = undefined,
            userID = undefined,
            created = undefined,
            edited = undefined,
            body = searchString,
            limit = undefined,
            offset = undefined,
            currentUserID = undefined,
            client = pool
        } = extras;
        const commentid = UUIDHelper.toUUID(commentID),
            commentthreadid = UUIDHelper.toUUID(commentThreadID),
            submissionid = UUIDHelper.toUUID(submissionID),
            courseid = UUIDHelper.toUUID(courseID),
            userid = UUIDHelper.toUUID(userID),
            currentuserid = UUIDHelper.toUUID(currentUserID),
            bodysearch = searchify(body);

        const args = [commentid, commentthreadid, submissionid, courseid, userid,
            created, edited, bodysearch, limit, offset, currentuserid];
        type argType = typeof args;
        return client.query<DBAPIComment & DBAPISubmission, argType>(`	
			SELECT c.*, s.*
			FROM "CommentsView" as c, "SubmissionsView" as s, viewableSubmissions($11, $4) as opts
			WHERE 
				c.submissionID = s.submissionID
			AND ($1::uuid IS NULL OR c.commentID=$1)
			AND ($2::uuid IS NULL OR c.commentThreadID=$2)
			AND ($3::uuid IS NULL OR c.submissionID=$3)
			AND ($4::uuid IS NULL OR c.courseID=$4)
			AND ($5::uuid IS NULL OR c.userID=$5) 
			AND ($6::timestamp IS NULL OR c.created >= $6)
			AND ($7::timestamp IS NULL OR c.edited >= $7)
			AND ($8::text IS NULL OR c.body ILIKE $8)
			
			AND c.submissionID = opts.submissionID
			ORDER BY c.created DESC, c.commentID --unique when 2 comments same time
			LIMIT $9
			OFFSET $10
			`, args)
            .then(extract).then(map(entry => ({
                submission: submissionToAPI(entry),
                comment: commentToAPI(entry)
            })))
    }

    /**
     *
     * @param comment    the fields submissionID and courseID will be ignored, as well as limit and offset
     *                    created/edited does not have to be supplied.
     */
    static async addComment(comment: Comment) {
        checkAvailable(['commentThreadID', 'userID', 'body'], comment);
        const {
            commentThreadID,
            userID,
            created = new Date(),
            edited = new Date(),
            body,
            client = pool
        } = comment;
        const commentThreadid = UUIDHelper.toUUID(commentThreadID),
            userid = UUIDHelper.toUUID(userID);
        const args = [commentThreadid, userid, created, edited, body];
        type argType = typeof args;
        return client.query<DBAPIComment, argType>(`
			with insert as (
				INSERT INTO "Comments" 
				VALUES (DEFAULT, $1, $2, $3, $4, $5)
				RETURNING *
			)
			${commentsView('insert')}
			`, args)
            .then(extract).then(map(commentToAPI)).then(one)
    }

    /**
     * update a single comment, identified by its ID
     * @param comment    commentID is required and cannot be updated, all others are optional
     *                    Updating all other IDs is strongly discouraged, though possible.
     */
    static async updateComment(comment: Comment) {
        checkAvailable(['commentID'], comment);
        const {
            commentID,
            commentThreadID = undefined,
            submissionID = undefined,
            courseID = undefined,
            userID = undefined,
            created = undefined,
            edited = undefined,
            body = undefined,
            client = pool
        } = comment;
        const commentid = UUIDHelper.toUUID(commentID),
            commentThreadid = UUIDHelper.toUUID(commentThreadID),
            submissionid = UUIDHelper.toUUID(submissionID),
            courseid = UUIDHelper.toUUID(courseID),
            userid = UUIDHelper.toUUID(userID);

        if (commentid !== undefined
            || submissionid !== undefined
            || courseid !== undefined
            || userID !== undefined) {
            console.warn("Updating IDs is almost never a good idea")
        }
        const args = [commentid, commentThreadid, userid, created, edited, body];
        type argType = typeof args

        return client.query<DBAPIComment, argType>(`
			WITH update AS (
				UPDATE "Comments" SET 
				commentThreadID = COALESCE($2, commentThreadID),
				userID = COALESCE($3,userID),
				created = COALESCE($4, created),
				edited = COALESCE($5, edited),
				body = COALESCE($6, body)
				WHERE commentID =$1
				RETURNING *
			)
			${commentsView('update')}
			`, args)
            .then(extract).then(map(commentToAPI)).then(one)
    }

    /**
     * delete a single comment from the database.
     * @param commentID ID of the comment to be deleted
     * @param client optional; when using transactions, pass the client to this function so it can be used to perform this query.
     */
    static async deleteComment(commentID: string, client: pgDB = pool) {
        const commentid = UUIDHelper.toUUID(commentID);
        return client.query<DBAPIComment, [string]>(`
			WITH delete AS (
				DELETE FROM "Comments" 
				WHERE commentID=$1
				RETURNING *
			)
			${commentsView('delete')}
			`, [commentid])
            .then(extract).then(map(commentToAPI)).then(one)
    }
}
