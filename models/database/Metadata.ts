import { DBTools, checkAvailable } from "../../api/src/database/HelperDB";

export interface Metadata extends DBTools {
    key?: string,
    value?: string
}

export interface DBMetadata {
    key: string,
    value: string
}

export function getValue(db: DBMetadata) {
    checkAvailable(["value"], db);
    return db.value;
}