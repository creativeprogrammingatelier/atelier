import { MetadataDB } from "../MetadataDB";
import { pgDB, transaction } from "../HelperDB";
import { dropViewQueries, createViewQueries } from "./DatabaseStructure";
/**
 * Database Migrations - Contains function for permforming database migrations including upgrading of the database.
 */

interface Migrations { 
    [version: number]: (client: pgDB) => Promise<void> 
}

/**
 * Defined migrations
 */
const migrations: Migrations = {
    5: async client => {
        client.query(`
            ALTER TABLE "Users"
                ADD COLUMN canvasrefresh text UNIQUE;
            ALTER TABLE "Courses"
                ADD COLUMN canvasCourseID text;
        `);
    },

    // Adds automated and sharedBy fields to CommentThread, to distinguish automated
    // comments and add the ability to show the user that made such a comment public
    4: async client => {
        client.query(`
            ALTER TABLE "CommentThread" 
                ADD COLUMN automated boolean NOT NULL DEFAULT FALSE,
                ADD COLUMN sharedBy uuid REFERENCES "Users"(userID) ON DELETE SET NULL;
            -- Set threads created by plugins as automated:
            UPDATE "CommentThread" AS ct SET automated = TRUE
                FROM "Comments" as c, "Users" AS u 
                WHERE c.commentThreadID = ct.commentThreadID
                AND c.userID = u.userID
                AND c.created = (SELECT MIN(created) FROM "Comments" as c2 WHERE c2.commentThreadID = ct.commentThreadID)
                AND u.globalRole = 'plugin';
        `);
    },

    // Adds a table with tag
    3: async client => {
        client.query(`
            CREATE TABLE "Tags" (
	                tagID      		uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	                commentID      	uuid NOT NULL REFERENCES "Comments"(commentID) ON DELETE CASCADE,
	                tagbody         text NOT NULL
            );
        `);
    },

    // Introduces a new researchAllowed column in the Users table
    2: async client => {
        client.query(`
            ALTER TABLE "Users" ADD COLUMN researchAllowed boolean
        `);
    },

    // The base schema when migrations were introduced
    1: async client => {
        // There is no previous version, so this should never run
    }
}
/**
 * Upgrades the database to newer version
 */
export async function upgradeDatabase() {
    const version = await getCurrentVersion();
    const migrationVersions =
        Object.keys(migrations)
            .map(Number)
            .filter(mv => mv > version)
            .sort();
    await transaction(async client => {
        console.log("Starting database migration");
        console.log("Deleting database views");
        await client.query(dropViewQueries);

        for (const migration of migrationVersions) {
            await runMigration(migration, client);
        }

        console.log("Recreating database views");
        await client.query(createViewQueries);

        console.log("Database migration finished");
    });
}

/**
 * Allows for the performing of migrations based on the previously defined possible migrations
 * @param version 
 * @param client 
 */
async function runMigration(version: number, client: pgDB) {
    const migrate = migrations[version];
    if (migrate !== undefined) {
        try {
            await migrate(client);
            await setVersion(version, client);
            console.log("Upgraded database to version", version);
        } catch (err) {
            err.message = `Upgrading database to version ${version} failed. ` + err.message;
            throw err;
        }
    } else {
        throw new Error(`Database migration to version ${version} does not exist.`);
    }
}
/**
 * 
 * @param client Getter for current version
 */
async function getCurrentVersion(client?: pgDB) {
    const version = await MetadataDB.get("version", client);
    return Number(version);
}
/**
 * Setter for version 
 * @param version 
 * @param client 
 */
async function setVersion(version: number, client: pgDB) {
    await MetadataDB.set("version", version.toFixed(0), client);
}
