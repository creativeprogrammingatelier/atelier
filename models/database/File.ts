import { UUIDHelper } from "../../api/src/helpers/UUIDHelper";
import {File as APIFile} from "../api/File"
/**
 * Modeling the file object
 * Author: Andrew Heath
 * Date created: 15/08/19
 */

export interface File {
	fileID? : string,
	submissionID? : string,
	courseID? : string,
	pathname? : string,
	type? : string
}

export interface DBFile {
	fileid : string,
	submissionid : string,
	courseid: string,
	pathname : string,
	type : string
}

export {APIFile}

export type DBAPIFile = DBFile

export function convertFile(db : DBFile) : File {
	return {
		fileID: UUIDHelper.fromUUID(db.fileid),
		submissionID: UUIDHelper.fromUUID(db.submissionid),
		courseID: UUIDHelper.fromUUID(db.courseid),
		pathname: db.pathname,
		type: db.type
	}
}

export function fileToAPI(db :DBAPIFile) : APIFile {
	return {
		ID:UUIDHelper.fromUUID(db.fileid),
		name: db.pathname,
		type: db.type,
		references:{
			courseID: UUIDHelper.fromUUID(db.courseid),
			submissionID: UUIDHelper.fromUUID(db.submissionid),
		}
	}
}