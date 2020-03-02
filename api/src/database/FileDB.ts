import {pool, extract, map, one, pgDB, checkAvailable, DBTools } from "./HelperDB";
import {File, DBFile, convertFile, fileToAPI, APIFile} from '../../../models/database/File';
import { UUIDHelper } from "../helpers/UUIDHelper";

/**
 * fileID, submissionID, pathname, type
 * @Author Rens Leendertz
 */
export class FileDB {
	static async getFilesBySubmissionIDS(ids : string[], params : DBTools = {}){
		const {
			client =pool
		} = params
		//this object is used as a map.
		// tslint:disable-next-line: no-any
		const mapping : any = {}
		ids.forEach(id => {
			mapping[id] = []
		});
		const uuids = ids.map(UUIDHelper.toUUID)
		const files = await client.query(`
			SELECT * 
			FROM "FilesView"
			WHERE submissionID = ANY($1)
		`, [uuids]).then(extract).then(map(fileToAPI));
		files.forEach(file => {
			if (file.references.submissionID in mapping){
				(mapping[file.references.submissionID] as APIFile[]).push(file)
			} else {
				throw new Error("concurrent modification exception")
			}
		});
		return mapping;
	}


	static async getAllFiles(params : DBTools = {}){
		return FileDB.getFilteredFiles(params)
	}

	static async getFileByID(fileID : string, params : DBTools = {}){
		return FileDB.getFilteredFiles({...params, fileID}).then(one)
	}
	
	static async getFilesBySubmission(submissionID : string, params : DBTools = {}) {
		return FileDB.getFilteredFiles({...params, submissionID})
	}

	static async getFilteredFiles(file : File){
		const {
			fileID = undefined,
			submissionID = undefined,
			courseID = undefined,
			pathname = undefined,
			type = undefined,

			limit = undefined,
			offset = undefined,
			client = pool
		} = file;
		const fileid = UUIDHelper.toUUID(fileID),
			submissionid = UUIDHelper.toUUID(submissionID),
			courseid = UUIDHelper.toUUID(courseID)

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
		.then(extract).then(map(fileToAPI))
	}

	static async addFile(file : File) {
		checkAvailable(['submissionID','pathname','type'],file)
		const {
			submissionID,
			pathname,
			type,
			client =pool
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
		SELECT f.*, sr.courseID
     	FROM insert as f, "SubmissionsRefs" as sr
     	WHERE f.submissionID = sr.submissionID
			`, [submissionid, pathname, type])
		.then(extract).then(map(fileToAPI)).then(one)
	}
	
	static async updateFile(file : File) {
		checkAvailable(['fileID'],file)
		const {
			fileID,
			pathname = undefined,
			type = undefined,
			client = pool
		} = file;
		const fileid = UUIDHelper.toUUID(fileID)
		return client.query(`
		WITH update AS (
			UPDATE "Files" SET
			pathname = COALESCE($2, pathname),
			type = COALESCE($3, type)
			WHERE fileID=$1
			RETURNING *
		)
		SELECT f.*, sr.courseID
		FROM update as f, "SubmissionsRefs" as sr
		WHERE f.submissionID = sr.submissionID
		`, [fileid, pathname, type])
		.then(extract).then(map(fileToAPI)).then(one)
	}
	
	static async deleteFile(fileID : string, client : pgDB = pool){
		const fileid = UUIDHelper.toUUID(fileID);
		return client.query(`
		WITH delete AS (
			DELETE FROM "Files" 
			WHERE fileID=$1 
			RETURNING *
		)
		SELECT f.*, sr.courseID
		FROM delete as f, "SubmissionsRefs" as sr
		WHERE f.submissionID = sr.submissionID
		`,[fileid])
		.then(extract).then(map(fileToAPI)).then(one)
	}
}