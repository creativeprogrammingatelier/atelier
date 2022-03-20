import {pgDB} from "../database/HelperDB";
import {User} from "../../../models/api/User";
import {PrefixLookupTree} from "./PrefixLookupTree";
import {UserDB} from "../database/UserDB";

interface CacheItem {
    lookupTree: PrefixLookupTree<User>;
    lastUpdated: Date;
}

/** Caching layer for mention lookups to spare the database. */
export class MentionsUserCache {
    /** Map to store the cache, indexed by courseID. */
    private cache: Map<string, CacheItem> = new Map();
    private expirationMs = 1000 * 60 * 60; // 1 hour

    /** Get the prefix lookup tree associated with a certain course. */
    private async getLookupTree(courseID: string, client?: pgDB) {
        // Try to get the lookup tree from the cache.
        const item = this.cache.get(courseID);
        // If it is not in the cache, or it is expired,
        if (item === undefined || item.lastUpdated.getTime() < Date.now() - this.expirationMs) {
            // then get the full userlist for this course from the database,
            const users = await UserDB.filterUserInCourse({courseID, client});
            // create the lookup tree for it,
            const lookupTree = PrefixLookupTree.ofList(users, u => u.name);
            // store it in the cache,
            this.cache.set(courseID, {lookupTree, lastUpdated: new Date()});
            // and return it.
            return lookupTree;
        } else {
            // If it is in the cache, and it is not expired, return it.
            return item.lookupTree;
        }
    }

    /** Get the user that is mentioned at the start of the possibleMention string. */
    public async getUserForPossibleMention(possibleMention: string, courseID: string, client?: pgDB) {
        const lookupTree = await this.getLookupTree(courseID, client);
        const user = lookupTree.lookup(possibleMention);
        if (user === undefined) {
            return possibleMention;
        } else {
            return user;
        }
    }
}
