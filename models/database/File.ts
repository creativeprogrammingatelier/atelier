import {UUIDHelper} from "../../api/src/helpers/UUIDHelper";
import {DBTools, checkAvailable} from "../../api/src/database/HelperDB";

import {File as APIFile} from "../api/File";

export interface File extends DBTools {
	fileID?: string,
	submissionID?: string,
	courseID?: string,
	pathname?: string,
	type?: string,
	includeNulls?: boolean,
}
export interface DBFile {
	fileid: string,
	submissionid: string,
	courseid: string,
	pathname: string,
	type: string
}

export {APIFile};
export type DBAPIFile = DBFile

export function filterNullFiles<T extends {type: string}>(files: T[]) {
	return files.filter(isNotNullFile);
}
export function isNotNullFile(file: {type: string}) {
	return file.type !== "undefined/undefined";
}
export function convertFile(db: DBFile): File {
	checkAvailable(["fileid", "pathname", "type", "courseid", "submissionid"], db);
	return {
		fileID: UUIDHelper.fromUUID(db.fileid),
		submissionID: UUIDHelper.fromUUID(db.submissionid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		pathname: db.pathname,
		type: db.type
	};
}
export function fileToAPI(db: DBAPIFile): APIFile {
	checkAvailable(["fileid", "pathname", "type", "courseid", "submissionid"], db);
	return {
		ID: UUIDHelper.fromUUID(db.fileid),
		name: db.pathname,
		type: db.type,
		references: {
			courseID: UUIDHelper.fromUUID(db.courseid),
			submissionID: UUIDHelper.fromUUID(db.submissionid)
		}
	};
}