import { UserDB } from "../database/UserDB";
import { pgDB } from "../database/HelperDB";
import { NotFoundDatabaseError } from "../database/DatabaseErrors";
import { User } from "../../../models/api/User";

export function getPossibleMentions(commentBody: string) {
    return commentBody.split('@').slice(1).map(mention => mention.trim());
}

async function getUserForPossibleMention(possibleMention: string, courseID: string, client?: pgDB) {
    try {
        return await UserDB.getUserByPossibleMentionInCourse(possibleMention, courseID, { client });
    } catch (err) {
        if (err instanceof NotFoundDatabaseError) {
            return undefined;
        } else {
            throw err;
        }
    }
}

export async function getMentions(commentBody: string, courseID: string, client?: pgDB) {
    const users = await Promise.all(
        getPossibleMentions(commentBody)
            .map(pm => getUserForPossibleMention(pm, courseID, client))
    );
    return users.filter(u => u !== undefined) as User[];
}