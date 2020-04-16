import {SearchResultFile} from "../../../models/api/SearchResult";
import {File, DBFile, fileToAPI, APIFile, filterNullFiles, isNotNullFile} from "../../../models/database/File";
import {submissionToAPI} from "../../../models/database/Submission";
import {Sorting} from "../../../models/enums/SortingEnum";

import {UUIDHelper} from "../helpers/UUIDHelper";

import {pool, extract, map, one, pgDB, checkAvailable, DBTools, doIf, searchify} from "./HelperDB";
import {filesView} from "./ViewsDB";

/**
 * fileID, submissionID, pathname, type
 * @Author Rens Leendertz
 */
export class FileDB {
	static async getFilesBySubmissionIDS(ids: string[], params: DBTools = {}) {
		const {
			client = pool
		} = params;
		//this object is used as a map.
		// tslint:disable-next-line: no-any
		const mapping: any = {};
		ids.forEach(id => {
			mapping[id] = [];
		});
		const uuids = ids.map(UUIDHelper.toUUID);
		const files = await client.query(`
			SELECT * 
			FROM "FilesView"
			WHERE submissionID = ANY($1)
		`, [uuids]).then(extract).then(map(fileToAPI));
		files.forEach(file => {
			if (file.references.submissionID in mapping) {
				(mapping[file.references.submissionID] as APIFile[]).push(file);
			} else {
				throw new Error("concurrent modification exception");
			}
		});
		return mapping;
	}
	static async getAllFiles(params: DBTools = {}) {
		return FileDB.getFilteredFiles(params);
	}
	static async getFileByID(fileID: string, params: DBTools = {}) {
		return FileDB.getFilteredFiles({...params, fileID}).then(one);
	}
	static async getFilesBySubmission(submissionID: string, params: DBTools = {}) {
		return FileDB.getFilteredFiles({...params, submissionID});
	}
	static async getFilteredFiles(file: File) {
		const {
			fileID = undefined,
			submissionID = undefined,
			courseID = undefined,
			pathname = undefined,
			type = undefined,
			
			limit = undefined,
			offset = undefined,
			client = pool,
			
			includeNulls = false //exclude normally
		} = file;
		const fileid = UUIDHelper.toUUID(fileID),
			submissionid = UUIDHelper.toUUID(submissionID),
			courseid = UUIDHelper.toUUID(courseID);
		
		return client.query(`
			SELECT * FROM "FilesView" 
			WHERE
				($1::uuid IS NULL OR fileID=$1)
			AND ($2::uuid IS NULL OR submissionID=$2)
			AND ($3::uuid IS NULL OR courseID=$3)
			AND ($4::text IS NULL OR pathname=$4)
			AND ($5::text IS NULL OR type=$5)
			ORDER BY pathname, type, fileID
			LIMIT $6
			OFFSET $7
			`, [fileid, submissionid, courseid, pathname, type, limit, offset])
			.then(extract).then(map(fileToAPI)).then(filterNullFiles).then(doIf(!includeNulls, filterNullFiles));
	}
	
	static async searchFiles(searchString: string, extras: File): Promise<SearchResultFile[]> {
		checkAvailable(["currentUserID", "courseID"], extras);
		const {
			fileID = undefined,
			submissionID = undefined,
			courseID = undefined,
			pathname = searchString,
			type = undefined,
			
			limit = undefined,
			offset = undefined,
			sorting = Sorting.datetime,
			client = pool,
			currentUserID = undefined,
			
			includeNulls = false //exclude normally
		} = extras;
		const fileid = UUIDHelper.toUUID(fileID),
			submissionid = UUIDHelper.toUUID(submissionID),
			courseid = UUIDHelper.toUUID(courseID),
			currentuserid = UUIDHelper.toUUID(currentUserID),
			searchFile = searchify(pathname);
		return client.query(`
			SELECT f.*, s.*
			FROM "FilesView" as f, "SubmissionsView" as s, viewableSubmissions($8, $3) as opts
			WHERE
				s.submissionID = f.submissionID
			AND ($1::uuid IS NULL OR f.fileID=$1)
			AND ($2::uuid IS NULL OR f.submissionID=$2)
			AND ($3::uuid IS NULL OR f.courseID=$3)
			AND ($5::text IS NULL OR f.type=$5)
			AND ($4::text IS NULL OR right(f.pathname, -length(s.title)-1) ILIKE $4)
			AND f.submissionID = opts.submissionID
			ORDER BY ${sorting === Sorting.alphabetical ? `right(f.pathname, -length(s.title)-1)` : `s.date`}, f.type, f.fileID
			LIMIT $6
			OFFSET $7
			`, [fileid, submissionid, courseid, searchFile, type, limit, offset, currentuserid])
			.then(extract).then(map(entry => ({
				file: fileToAPI(entry),
				submission: submissionToAPI(entry)
			}))).then(doIf(!includeNulls, entries =>
				entries.filter(entry => isNotNullFile(entry.file))
			));
	}
	
	/**
	 * @deprecated is now handled by a database trigger
	 * @param submissionID
	 * @param params
	 */
	static async createNullFile(submissionID: string, params: DBTools = {}) {
		const submissionid = UUIDHelper.toUUID(submissionID);
		const {client = pool} = params;
		return client.query(`
		INSERT INTO "Files"
		VALUES (DEFAULT, $1, '', 'undefined/undefined') 
		RETURNING fileID
		`, [submissionid]).then(extract).then(one).then((res: DBFile) => UUIDHelper.fromUUID(res.fileid));
	}
	static async getNullFileID(submissionID: string, params: DBTools = {}) {
		const submissionid = UUIDHelper.toUUID(submissionID);
		const {client = pool} = params;
		return client.query<{fileid: string}, [string]>(`
		SELECT fileID
		FROM "Files"
		WHERE submissionID = $1
		  AND type = 'undefined/undefined'
		`, [submissionid]).then(extract).then(one).then(res => UUIDHelper.fromUUID(res.fileid));
	}
	
	static async addFile(file: File) {
		checkAvailable(["submissionID", "pathname", "type"], file);
		const {
			submissionID,
			pathname,
			type,
			client = pool
		} = file;
		const submissionid = UUIDHelper.toUUID(submissionID);
		return client.query(`
		WITH insert as (
			INSERT INTO "Files" 
			VALUES (
				DEFAULT, 
				$1,
				$2,
				$3
			) 
			RETURNING *
		)
		${filesView("insert")}
			`, [submissionid, pathname, type])
			.then(extract).then(map(fileToAPI)).then(one);
	}
	static async updateFile(file: File) {
		checkAvailable(["fileID"], file);
		const {
			fileID,
			pathname = undefined,
			type = undefined,
			client = pool
		} = file;
		const fileid = UUIDHelper.toUUID(fileID);
		return client.query(`
		WITH update AS (
			UPDATE "Files" SET
			pathname = COALESCE($2, pathname),
			type = COALESCE($3, type)
			WHERE fileID=$1
			RETURNING *
		)
		${filesView("update")}
		`, [fileid, pathname, type])
			.then(extract).then(map(fileToAPI)).then(one);
	}
	static async deleteFile(fileID: string, client: pgDB = pool) {
		const fileid = UUIDHelper.toUUID(fileID);
		return client.query(`
		WITH delete AS (
			DELETE FROM "Files" 
			WHERE fileID=$1 
			RETURNING *
		)
		${filesView("delete")}
		`, [fileid])
			.then(extract).then(map(fileToAPI)).then(one);
	}
}