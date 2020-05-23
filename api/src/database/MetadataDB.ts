import { pool, extract, one, pgDB } from "./HelperDB"
import { getValue } from "../../../models/database/Metadata"

export class MetadataDB {
    static async get(key: string, client: pgDB = pool) {
        return client
            .query(`SELECT value FROM "Metadata" WHERE key = $1`, [key])
            .then(extract).then(one).then(getValue);
    }
}