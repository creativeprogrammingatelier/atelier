import {pool, extract, one, pgDB} from './HelperDB';
import {getValue} from '../../../models/database/Metadata';

export class MetadataDB {
  static async get(key: string, client: pgDB = pool) {
    return client
        .query(`SELECT value FROM "Metadata" WHERE key = $1`, [key])
        .then(extract).then(one).then(getValue);
  }

  static async set(key: string, value: string, client: pgDB = pool) {
    return client
        .query(`
                INSERT INTO "Metadata" VALUES ($1, $2)
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
                RETURNING value
            `, [key, value])
        .then(extract).then(one).then(getValue);
  }
}
