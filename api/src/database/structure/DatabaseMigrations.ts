import { MetadataDB } from "../MetadataDB";
import { pgDB, transaction } from "../HelperDB";

interface Migrations { 
    [version: number]: (client: pgDB) => Promise<void> 
}

const migrations: Migrations = {
    1: async client => {
        // v1 is the base schema when migrations were introduced
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
    for (const migration of migrationVersions) {
        try {
            await runMigration(migration);
            console.log("Upgraded database to version", migration);
        } catch (err) {
            console.error("Upgrading database to version", migration, "failed. Starting Atelier will be aborted.");
            console.error(err);
            process.exit(1);
        }
    }
}

async function runMigration(version: number) {
    const migrate = migrations[version];
    if (migrate !== undefined) {
        return transaction(async client => {
            await migrate(client);
            await setVersion(version, client);
        });
    } else {
        return Promise.reject(new Error(`Database migration to version ${version} does not exist.`));
    }
}

async function getCurrentVersion(client?: pgDB) {
    const version = await MetadataDB.get("version", client);
    return Number(version);
}

async function setVersion(version: number, client: pgDB) {
    await MetadataDB.set("version", version.toFixed(0), client);
}
