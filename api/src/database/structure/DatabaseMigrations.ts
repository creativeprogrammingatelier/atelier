import { MetadataDB } from "../MetadataDB";
import { pgDB, transaction } from "../HelperDB";
import { dropViewQueries, createViewQueries } from "./DatabaseStructure";

interface Migrations { 
    [version: number]: (client: pgDB) => Promise<void> 
}

const migrations: Migrations = {
    // The base schema when migrations were introduced
    1: async client => {
        // There is no previous version, so this should never run
    }
}

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

async function getCurrentVersion(client?: pgDB) {
    const version = await MetadataDB.get("version", client);
    return Number(version);
}

async function setVersion(version: number, client: pgDB) {
    await MetadataDB.set("version", version.toFixed(0), client);
}
