import {Tag, tagToAPI} from "../../../models/database/Tag";

import {UUIDHelper} from "./helpers/UUIDHelper";

import {pool, extract, map, one, checkAvailable, pgDB} from "./HelperDB";
import {TagsView} from "./ViewsDB";

interface SignOff {
    tag: string
    student: string
    submission: string
    submittedby: string
    ta: string
    date: Date
}

export class TagsDB {
    /**
     * Adds a Tag to the database
     * @param tag
     */
    static async addTag(tag: Tag) {
        checkAvailable(["commentID", "tagbody"], tag);
        const {
            commentID,
            tagbody,
            client = pool
        } = tag;
        const commentid = UUIDHelper.toUUID(commentID);
        return client.query(`
        WITH insert AS (
            INSERT INTO "Tags"
            VALUES (DEFAULT, $1, $2)
            RETURNING *
        )
        ${TagsView("insert")}
        `, [commentid, tagbody])
            .then(extract).then(map(tagToAPI)).then(one);
    }

    /**
     * gets the most used tags from the database
     * @param amount
     */
    static async getMostUsedTags(amount: number) {
        return pool.query(`
        SELECT g.*
        FROM (
               SELECT  f.* ,
               RANK () OVER (
                PARTITION BY f.tagbody
                ORDER BY f.count DESC
            ) rank_number
             FROM (
                SELECT v.*,
                COUNT(v.tagbody) OVER (
                       PARTITION BY v.tagbody
                    ORDER BY tagid DESC
                   )
                FROM "TagsView" as v
            ) f
        ) g
        WHERE g.rank_number =1
        ORDER BY count DESC
        LIMIT $1
        `, [amount])
            .then(extract).then(map(tagToAPI));
    }

    /**
     * Gets a list of signed off students for a course when using a specific tag for signing off.
     * The tag start is used so that e.g. tagging with topic3 will be included when matching on 'topic'.
     * @param courseID The course id to get signoffs for
     * @param tagStart The start of the tags used for signing off
     */
    static async getSignOffs(courseID: string, tagStart: string, client?: pgDB): Promise<SignOff[]> {
        client = client || pool;
        courseID = UUIDHelper.toUUID(courseID);
        return client.query(`
        SELECT tagbody AS tag, submissionusername AS student, submissionname AS submission, tag.submissionusername AS submittedby, cmuusername AS ta, created AS date
        FROM "TagsView" AS tag
        JOIN "CourseUsersView" AS ta ON tag.cmuuserid = ta.userid AND tag.courseid = ta.courseid
        WHERE tag.courseid = $1
        AND tagbody LIKE ($2 || '%')
        AND ta.courserole IN ('TA', 'teacher', 'moduleCoordinator')
        UNION
        SELECT tagbody AS tag, men.username AS student, tag.submissionname AS submission, tag.submissionusername AS submittedby, tag.cmuusername AS ta, tag.created AS date
        FROM "TagsView" AS tag
        JOIN "CourseUsersView" AS ta ON tag.cmuuserid = ta.userid AND tag.courseid = ta.courseid
        JOIN "MentionsView" AS men ON tag.submissionid = men.submissionid
        WHERE tag.courseid = $1
        AND tagbody LIKE ($2 || '%')
        AND ta.courserole IN ('TA', 'teacher', 'moduleCoordinator')
        AND men.courserole = 'student'
        ORDER BY date DESC;
        `, [courseID, tagStart])
            .then(extract);
    }
}
