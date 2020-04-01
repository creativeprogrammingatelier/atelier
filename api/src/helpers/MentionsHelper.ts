import { UserDB } from "../database/UserDB";
import { pgDB } from "../database/HelperDB";
import { NotFoundDatabaseError } from "../database/DatabaseErrors";
import { User } from "../../../models/api/User";
import { CourseRole } from "../../../models/enums/CourseRoleEnum";
import { MentionsDB } from "../database/MentionsDB";
import { CourseRegistrationDB } from "../database/CourseRegistrationDB";
import { containsPermission, PermissionEnum } from "../../../models/enums/PermissionEnum";
import { Mention } from "../../../models/api/Mention";

/** Get the parts of the a comment following the @-sign, which starts a mention */
export function getPossibleMentions(commentBody: string) {
    return commentBody.split('@').slice(1).map(mention => mention.trim());
}

/** 
 * Make a database call to find a user that matches the first part of a possible mention,
 * returning the possbileMention if none is found
 */
async function getUserForPossibleMention(possibleMention: string, courseID: string, client?: pgDB) {
    try {
        return await UserDB.getUserByPossibleMentionInCourse(possibleMention, courseID, { client });
    } catch (err) {
        if (err instanceof NotFoundDatabaseError) {
            return possibleMention;
        } else {
            throw err;
        }
    }
}

/** Find a course role that matches the first part of a possible mention */
function getRoleForPossibleMention(possibleMention: string) {
    const roles = Object.values(CourseRole).filter(cr => possibleMention.toLowerCase().startsWith(cr.toLowerCase()));
    if (roles.length >= 1) {
        return roles.sort((a, b) => a.length - b.length)[0];
    } else {
        return undefined;
    }
}

/** Get the mentioned users and groups for a comment */
export async function getMentions(commentBody: string, courseID: string, client?: pgDB) {
    const users = await Promise.all(
        getPossibleMentions(commentBody)
            .map(pm => getUserForPossibleMention(pm, courseID, client))
    );
    return users
        .map(userOrComment => 
            typeof(userOrComment) === "string" 
            ? getRoleForPossibleMention(userOrComment) 
            : userOrComment)
        .filter(u => u !== undefined) as Array<CourseRole | User>;
}

/** Add the mentions the user is allowed to make to the database */
export async function createAllowedMentions(commentID: string, mentions: Array<CourseRole | User>, currentUserID: string, courseID: string, client?: pgDB) {
    const { permission: { permissions } } = await CourseRegistrationDB.getSingleEntry(courseID, currentUserID, { client });
    const dbMentions = await Promise.all(mentions.map(mention => {
        if (typeof(mention) === "string") {
            let allowed;
            switch (mention) {
                case CourseRole.teacher:
                    allowed = containsPermission(PermissionEnum.mentionAllTeachers, permissions);
                    break;
                case CourseRole.TA:
                    allowed = containsPermission(PermissionEnum.mentionAllAssistants, permissions);
                    break;
                case CourseRole.student:
                    allowed = containsPermission(PermissionEnum.mentionAllStudents, permissions);
                    break;
                default:
                    allowed = false;
            }
            if (allowed) {
                return MentionsDB.addMention({
                    commentID,
                    mentionGroup: mention,
                    client
                });
            } else {
                return Promise.resolve(undefined);
            }
        } else {
            return MentionsDB.addMention({
                commentID,
                userID: mention.ID,
                client
            });
        }
    }));
    return dbMentions.filter(m => m !== undefined) as Mention[];
}

/** Create the mentions for a comment */
export async function createMentions(commentBody: string, commentID: string, courseID: string, currentUserID: string, client?: pgDB) {
    const mentions = await getMentions(commentBody, courseID, client);
    return createAllowedMentions(commentID, mentions, currentUserID, courseID, client);
}